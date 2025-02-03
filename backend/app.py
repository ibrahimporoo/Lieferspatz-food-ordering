import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Restaurant, Lieferradius, Item, Bestellung, BestellteItem, populate_sample
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, decode_token
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
from flask_socketio import SocketIO, emit, join_room, leave_room
import base64
from sqlalchemy import desc

# app will be served at http://127.0.0.1:5000
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# in-memory store for tracking restaurant connections
restaurant_rooms = {}

# configure SQLite database location
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'db_praktikum_gruppe_1'
app.config['JWT_SECRET_KEY'] = 'db_praktikum_gruppe_1'
app.config['UPLOAD_FOLDER'] = 'static/img'    # directory to save images to
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

db.init_app(app)
jwt = JWTManager(app)


# check if submitted file is of allowed type
def allowed_filetype(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


# format the open hours of restaurants into nice strings
def format_hours(open_time, close_time):
    if open_time == -1 and close_time == -1:
        return "geschlossen"
    
    def parse_time(time):
        hours = time // 100
        minutes = time % 100
        return f"{hours:02}:{minutes:02}"
    
    return f"{parse_time(open_time)} - {parse_time(close_time)}"


# reset the DB and repopulate with sample data
# comment out to stop resetting db on app start
with app.app_context():
    db.drop_all()
    db.create_all()
    populate_sample()


#####################################################
# USER (KUNDEN) ROUTES
#####################################################

@app.route("/users/login", methods=["POST"])
def login_user():
    email = request.json.get("email")
    pw = request.json.get("passwort")
    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_passwort(pw):
        resp = {
            "status": "fail",
            "data": {
                "passwort": "Ungültige Zugangsdaten"
            }
        }
        return resp, 401
    # assign access of a user if email and password is valid
    access_token = create_access_token(identity=email, additional_claims={"role": "user"}, expires_delta=False)
    resp = {
        "status": "success",
        "data": {
            "access_token": access_token,
            "geld": user.geld
        }
    }
    return resp, 200


@app.route("/users/register", methods=["POST"])
def create_user():
    email = request.json.get("email")
    # check if an account with the same email already existed
    if User.query.filter_by(email=email).first():
        resp = {
            "status": "fail",
            "data": {
                "email": "Die E-Mail-Adresse wird bereits verwendet"
            }
        }
        return resp, 409
    vorname = request.json.get("vorname")
    nachname = request.json.get("nachname")
    adresse = request.json.get("adresse")
    plz = request.json.get("plz")
    pw = request.json.get("passwort")
    new_user = User(email=email, vorname=vorname, nachname=nachname, adresse=adresse, plz=plz)
    new_user.set_passwort(pw)
    db.session.add(new_user)
    db.session.commit()
    # automatically login the user by generating the access token
    access_token = create_access_token(identity=email, additional_claims={"role": "user"}, expires_delta=False)
    resp = {
        "status": "success",
        "data": {
            "access_token": access_token,
            "geld": new_user.geld
        }
    }
    return resp, 201


@app.route("/users/profile", methods=["GET"])
@jwt_required()
def profile_user():
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    resp = {
        "status": "success",
        "data": {
            "email": user.email,
            "vorname": user.vorname,
            "nachname": user.nachname,
            "adresse": user.adresse,
            "plz": user.plz,
            "geld": user.geld
        }
    }
    return resp, 200


# get all Restaurants
@app.route("/restaurants", methods=["GET"])
def get_restaurants():
    restaurants = Restaurant.query.all()
    resp = {
        "status": "success",
        "data": {
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "adresse": r.adresse,
                    "plz": r.plz,
                    "beschreibung": r.beschreibung,
                    "img_url": "http://127.0.0.1:5000/static/img/" + (r.img if r.img else "placeholder.png"),
                    "logo_url": "http://127.0.0.1:5000/static/img/" + (r.logo if r.logo else "placeholder.png"),
                    "mo": format_hours(r.mo_von, r.mo_bis),
                    "di": format_hours(r.di_von, r.di_bis),
                    "mi": format_hours(r.mi_von, r.mi_bis),
                    "do": format_hours(r.do_von, r.do_bis),
                    "fr": format_hours(r.fr_von, r.fr_bis),
                    "sa": format_hours(r.sa_von, r.sa_bis),
                    "so": format_hours(r.so_von, r.so_bis)
                } for r in restaurants
            ]
        }
    }
    return resp, 200


# get all open restaurants that can deliver to user's PLZ
@app.route("/restaurants/open", methods=["GET"])
@jwt_required()
def get_valid_restaurants():
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    now = datetime.now()
    current_day = now.weekday()    # returns 0 for Monday, 1 for Tuesday, etc.
    weekday_map = {
        0: ('mo_von', 'mo_bis'),
        1: ('di_von', 'di_bis'),
        2: ('mi_von', 'mi_bis'),
        3: ('do_von', 'do_bis'),
        4: ('fr_von', 'fr_bis'),
        5: ('sa_von', 'sa_bis'),
        6: ('so_von', 'so_bis')
    }
    open_time, close_time = weekday_map[current_day]
    current_time = now.hour * 100 + now.minute
    valid_restaurants = Restaurant.query.filter(
        Restaurant.lieferradien.any(Lieferradius.plz == user.plz),
        getattr(Restaurant, open_time) <= current_time,
        getattr(Restaurant, close_time) > current_time
    ).all()
    resp = {
        "status": "success",
        "data": {
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "adresse": r.adresse,
                    "plz": r.plz,
                    "beschreibung": r.beschreibung,
                    "img_url": "http://127.0.0.1:5000/static/img/" + (r.img if r.img else "placeholder.png"),
                    "logo_url": "http://127.0.0.1:5000/static/img/" + (r.logo if r.logo else "placeholder.png"),
                    "mo": format_hours(r.mo_von, r.mo_bis),
                    "di": format_hours(r.di_von, r.di_bis),
                    "mi": format_hours(r.mi_von, r.mi_bis),
                    "do": format_hours(r.do_von, r.do_bis),
                    "fr": format_hours(r.fr_von, r.fr_bis),
                    "sa": format_hours(r.sa_von, r.sa_bis),
                    "so": format_hours(r.so_von, r.so_bis)
                } for r in valid_restaurants
            ],
            "geld": user.geld
        }
    }
    return resp, 200


# detailed user view of a Restaurant and its Menu
@app.route("/restaurants/<int:resto_id>", methods=["GET"])
@jwt_required(optional=True)
def get_restaurant(resto_id):
    access = get_jwt()
    user = False
    if access:
        if access["role"] == "user":
            email = get_jwt_identity()
            user = User.query.filter_by(email=email).first()
    resto = Restaurant.query.filter_by(id=resto_id).first()
    if not resto:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    resto_data = {
        "id": resto.id,
        "name": resto.name,
        "adresse": resto.adresse,
        "plz": resto.plz,
        "beschreibung": resto.beschreibung,
        "img_url": "http://127.0.0.1:5000/static/img/" + (resto.img if resto.img else "placeholder.png"),
        "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png"),
        "mo": format_hours(resto.mo_von, resto.mo_bis),
        "di": format_hours(resto.di_von, resto.di_bis),
        "mi": format_hours(resto.mi_von, resto.mi_bis),
        "do": format_hours(resto.do_von, resto.do_bis),
        "fr": format_hours(resto.fr_von, resto.fr_bis),
        "sa": format_hours(resto.sa_von, resto.sa_bis),
        "so": format_hours(resto.so_von, resto.so_bis)
    }
    items = Item.query.filter_by(resto_id=resto.id).all()
    menu_items = [
        {
            "id": i.id,
            "name": i.name,
            "preis": i.preis,
            "beschreibung": i.beschreibung,
            "img_url": "http://127.0.0.1:5000/static/img/" + (i.img if i.img else "placeholder.png")
        } for i in items
    ]
    resp = {
        "status": "success",
        "data": {
            "restaurant": resto_data,
            "menu": menu_items
        }
    }
    if user:
        resp["data"]["geld"] = user.geld
    return resp, 200


# get all user baskets
@app.route("/baskets", methods=["GET"])
@jwt_required()
def get_baskets():
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    baskets = Bestellung.query.filter_by(user_id=user.id, status="in Warenkorb").all()
    resp = {
        "status": "success",
        "data": {
            "geld": user.geld,
            "baskets": []
        }
    }
    for b in baskets:
        resto = Restaurant.query.filter_by(id=b.resto_id).first()
        resp["data"]["baskets"].append({
            "id": b.id,
            "restaurant": {
                "id": resto.id,
                "name": resto.name,
                "adresse": resto.adresse,
                "plz": resto.plz,
                "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png")
            },
            "eingang": b.eingang,
            "anmerkung": b.anmerkung,
            "total": b.total,
            "items": [
                {
                    "item_id": i.item_id,
                    "name": i.name,
                    "preis": i.preis,
                    "anzahl": i.anzahl
                } for i in BestellteItem.query.filter_by(bestellung_id=b.id).all()
            ]
        })
    return resp, 200


# get a user basket
@app.route("/baskets/<int:id>", methods=["GET"])
@jwt_required()
def get_basket(id):
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    basket = Bestellung.query.filter_by(id=id).first()
    if not basket:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    if user.id != basket.user_id or basket.status != "in Warenkorb":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    resto = Restaurant.query.filter_by(id=basket.resto_id).first()
    resp = {
        "status": "success",
        "data": {
            "geld": user.geld,
            "basket": {
                "id": basket.id,
                "restaurant": {
                    "id": resto.id,
                    "name": resto.name,
                    "adresse": resto.adresse,
                    "plz": resto.plz,
                    "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png")
                },
                "eingang": basket.eingang,
                "anmerkung": basket.anmerkung,
                "total": basket.total
            },
            "items": [
                {
                    "item_id": i.item_id,
                    "name": i.name,
                    "preis": i.preis,
                    "anzahl": i.anzahl
                } for i in BestellteItem.query.filter_by(bestellung_id=id).all()
            ]
        }
    }
    return resp, 200


# update a basket, or create first if not existed
@app.route("/baskets/", defaults={'id': -1}, methods=["PUT"])
@app.route("/baskets/<int:id>", methods=["PUT"])
@jwt_required()
def update_basket(id):
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    data = request.json
    
    # get a Bestellung entity
    if id == -1:
        bestellung = Bestellung(user_id=user.id, resto_id=data.get("resto_id"), status="in Warenkorb")
        db.session.add(bestellung)
    else:
        bestellung = Bestellung.query.filter_by(id=id).first()
        if not bestellung:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige ID"
                }
            }
            return resp, 404
        if bestellung.status != "in Warenkorb" or bestellung.user_id != user.id:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Verbotene URL"
                }
            }
            return resp, 403
    
    # actualize the Bestellung fields
    bestellung.eingang = datetime.now()
    bestellung.anmerkung = data.get("anmerkung")
    bestellung.total = round(data.get("total"), 2)
    db.session.commit()
    
    # add/update/remove the individual items
    # for simplicity, we empty out the basket first before refilling with updated content
    # reject items which its reference item has been deleted in the meantime
    old_items = BestellteItem.query.filter_by(bestellung_id=bestellung.id).all()
    for i in old_items:
        db.session.delete(i)
    new_items = []
    for item in data.get("items"):
        if not Item.query.filter_by(id=item["item_id"]).first():
            bestellung.total = round(bestellung.total - item["preis"] * item["anzahl"], 2)
        else:
            new_items.append(BestellteItem(bestellung_id=bestellung.id, item_id=item["item_id"], name=item["name"], preis=item["preis"], anzahl=item["anzahl"]))
    db.session.add_all(new_items)
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": user.geld,
            "basket_id": bestellung.id
        }
    }
    return resp, 200
    

# finish ordering a basket, or create first if not existed
@app.route("/baskets/", defaults={'id': -1}, methods=["POST"])
@app.route("/baskets/<int:id>", methods=["POST"])
@jwt_required()
def order_basket(id):
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    data = request.json
    
    # get a Bestellung entity
    if id == -1:
        bestellung = Bestellung(user_id=user.id, resto_id=data.get("resto_id"), status="in Warenkorb")
        db.session.add(bestellung)
    else:
        bestellung = Bestellung.query.filter_by(id=id).first()
        if not bestellung:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige ID"
                }
            }
            return resp, 404
        if bestellung.status != "in Warenkorb" or bestellung.user_id != user.id:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Verbotene URL"
                }
            }
            return resp, 403
    
    # actualize the Bestellung fields
    bestellung.eingang = datetime.now()
    bestellung.anmerkung = data.get("anmerkung")
    bestellung.total = round(data.get("total"), 2)
    db.session.commit()
    
    # add/update/remove the individual items
    # for simplicity, we empty out the basket first before refilling with updated content
    old_items = BestellteItem.query.filter_by(bestellung_id=bestellung.id).all()
    for i in old_items:
        db.session.delete(i)
    new_items = []
    for item in data.get("items"):
        if not Item.query.filter_by(id=item["item_id"]).first():
            bestellung.total = round(bestellung.total - item["preis"] * item["anzahl"], 2)
        else:
            new_items.append(BestellteItem(bestellung_id=bestellung.id, item_id=item["item_id"], name=item["name"], preis=item["preis"], anzahl=item["anzahl"]))
    db.session.add_all(new_items)
    db.session.commit()
    
    # check if user money is sufficient
    if user.geld < bestellung.total:
        resp = {
            "status": "fail",
            "data": {
                "message": "Kontostand reicht nicht aus",
                "basket_id": bestellung.id
            }
        }
        return resp, 403
    # check if delivery is valid
    if user.plz not in [lr.plz for lr in Lieferradius.query.filter_by(resto_id=bestellung.resto_id).all()]:
        resp = {
            "status": "fail",
            "data": {
                "message": "Nicht lieferbar",
                "basket_id": bestellung.id
            }
        }
        return resp, 403
    # check if restaurant is open
    resto = Restaurant.query.filter_by(id=bestellung.resto_id).first()
    now = datetime.now()
    current_day = now.weekday()    # returns 0 for Monday, 1 for Tuesday, etc.
    weekday_map = {
        0: ('mo_von', 'mo_bis'),
        1: ('di_von', 'di_bis'),
        2: ('mi_von', 'mi_bis'),
        3: ('do_von', 'do_bis'),
        4: ('fr_von', 'fr_bis'),
        5: ('sa_von', 'sa_bis'),
        6: ('so_von', 'so_bis')
    }
    open_time, close_time = weekday_map[current_day]
    current_time = now.hour * 100 + now.minute
    if getattr(resto, open_time) == -1 or getattr(resto, close_time) == -1 or getattr(resto, open_time) > current_time or getattr(resto, close_time) < current_time:
        resp = {
            "status": "fail",
            "data": {
                "message": "Restaurant derzeit geschlossen",
                "basket_id": bestellung.id
            }
        }
        return resp, 403
    
    # passed all checks
    bestellung.status = "in Bearbeitung"
    user.geld = round(user.geld - bestellung.total, 2)
    admin = User.query.filter_by(id=1).first()
    admin.geld = round(admin.geld + bestellung.total, 2)
    db.session.commit()
    # NOTIFICATION
    # notify the restaurant if they are connected
    if resto.email in restaurant_rooms:
        socketio.emit('new_order', {'message': f'Neue Bestellung mit ID={bestellung.id}!', 'id': bestellung.id}, to=resto.email)
    
    resp = {
        "status": "success",
        "data": {
            "geld": user.geld,
            "bestellung_id": bestellung.id
        }
    }
    return resp, 201


@app.route("/baskets/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_basket(id):
    role = get_jwt()["role"]
    if role != "user":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    basket = Bestellung.query.filter_by(id=id).first()
    if not basket:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    if basket.status != "in Warenkorb" or basket.user_id != user.id:
        resp = {
            "status": "fail",
            "data": {
                "message": "Verbotene URL"
            }
        }
        return resp, 403
    
    basket_items = BestellteItem.query.filter_by(bestellung_id=id).all()
    for i in basket_items:
        db.session.delete(i)
    db.session.delete(basket)
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": user.geld
        }
    }
    return resp, 200


# get all of the user's or restaurant's orders
@app.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    role = get_jwt()["role"]
    if role != "user" and role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    
    if role == "user":
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        orders = Bestellung.query.filter_by(user_id=user.id).order_by(desc(Bestellung.eingang)).all()
        valid_orders = []
        for order in orders:
            if order.status != "in Warenkorb":
                valid_orders.append(order)
        resp = {
            "status": "success",
            "data": {
                "geld": user.geld,
                "orders": []
            }
        }
        for o in valid_orders:
            resto = Restaurant.query.filter_by(id=o.resto_id).first()
            resp["data"]["orders"].append({
                "id": o.id,
                "restaurant": {
                    "id": resto.id,
                    "name": resto.name,
                    "adresse": resto.adresse,
                    "plz": resto.plz,
                    "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png")
                },
                "eingang": o.eingang,
                "anmerkung": o.anmerkung,
                "total": o.total,
                "status": o.status,
                "items": [
                    {
                        "name": i.name,
                        "preis": i.preis,
                        "anzahl": i.anzahl
                    } for i in BestellteItem.query.filter_by(bestellung_id=o.id).all()
                ]
            })
        return resp, 200
    
    else:
        email = get_jwt_identity()
        resto = Restaurant.query.filter_by(email=email).first()
        orders = Bestellung.query.filter_by(resto_id=resto.id).order_by(desc(Bestellung.eingang)).all()
        valid_orders = []
        for order in orders:
            if order.status != "in Warenkorb":
                valid_orders.append(order)
        resp = {
            "status": "success",
            "data": {
                "geld": resto.geld,
                "orders": []
            }
        }
        for o in valid_orders:
            user = User.query.filter_by(id=o.user_id).first()
            resp["data"]["orders"].append({
                "id": o.id,
                "user": {
                    "vorname": user.vorname,
                    "nachname": user.nachname,
                    "adresse": user.adresse,
                    "plz": user.plz
                },
                "eingang": o.eingang,
                "anmerkung": o.anmerkung,
                "total": o.total,
                "status": o.status,
                "items": [
                    {
                        "name": i.name,
                        "preis": i.preis,
                        "anzahl": i.anzahl
                    } for i in BestellteItem.query.filter_by(bestellung_id=o.id).all()
                ]
            })
        return resp, 200


# get an order detail (as user / restaurant)
@app.route("/orders/<int:id>", methods=["GET"])
@jwt_required()
def get_order(id):
    role = get_jwt()["role"]
    if role != "user" and role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    
    if role == "user":
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        order = Bestellung.query.filter_by(id=id).first()
        if not order:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige ID"
                }
            }
            return resp, 404
        if user.id != order.user_id or order.status == "in Warenkorb":
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige URL"
                }
            }
            return resp, 404
        resto = Restaurant.query.filter_by(id=order.resto_id).first()
        resp = {
            "status": "success",
            "data": {
                "geld": user.geld,
                "order": {
                    "id": order.id,
                    "restaurant": {
                        "id": resto.id,
                        "name": resto.name,
                        "adresse": resto.adresse,
                        "plz": resto.plz,
                        "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png")
                    },
                    "eingang": order.eingang,
                    "anmerkung": order.anmerkung,
                    "total": order.total,
                    "status": order.status
                },
                "items": [
                    {
                        "name": i.name,
                        "preis": i.preis,
                        "anzahl": i.anzahl
                    } for i in BestellteItem.query.filter_by(bestellung_id=id).all()
                ]
            }
        }
        return resp, 200
    
    else:
        email = get_jwt_identity()
        resto = Restaurant.query.filter_by(email=email).first()
        order = Bestellung.query.filter_by(id=id).first()
        if not order:
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige ID"
                }
            }
            return resp, 404
        if resto.id != order.resto_id or order.status == "in Warenkorb":
            resp = {
                "status": "fail",
                "data": {
                    "message": "Ungültige URL"
                }
            }
            return resp, 404
        user = User.query.filter_by(id=order.user_id).first()
        resp = {
            "status": "success",
            "data": {
                "geld": resto.geld,
                "order": {
                    "id": order.id,
                    "user": {
                        "vorname": user.vorname,
                        "nachname": user.nachname,
                        "adresse": user.adresse,
                        "plz": user.plz
                    },
                    "eingang": order.eingang,
                    "anmerkung": order.anmerkung,
                    "total": order.total,
                    "status": order.status
                },
                "items": [
                    {
                        "name": i.name,
                        "preis": i.preis,
                        "anzahl": i.anzahl
                    } for i in BestellteItem.query.filter_by(bestellung_id=id).all()
                ]
            }
        }
        return resp, 200


#####################################################
# RESTAURANT ROUTES
#####################################################

@app.route("/restaurants/login", methods=["POST"])
def login_restaurant():
    email = request.json.get("email")
    pw = request.json.get("passwort")
    resto = Restaurant.query.filter_by(email=email).first()
    if resto is None or not resto.check_passwort(pw):
        resp = {
            "status": "fail",
            "data": {
                "passwort": "Ungültige Zugangsdaten"
            }
        }
        return resp, 401
    # assign access of a restaurant if email and password is valid
    access_token = create_access_token(identity=email, additional_claims={"role": "restaurant"}, expires_delta=False)
    resp = {
        "status": "success",
        "data": {
            "access_token": access_token,
            "geld": resto.geld
        }
    }
    return resp, 200


@app.route("/restaurants/register", methods=["POST"])
def create_restaurant():
    # check if an account with the same email already existed
    email = request.json.get("email")
    if Restaurant.query.filter_by(email=email).first():
        resp = {
            "status": "fail",
            "data": {
                "email": "Die E-Mail-Adresse wird bereits verwendet"
            }
        }
        return resp, 409
    # check if uploaded img and logo is of allowed type
    logo = request.json.get("logo")
    img = request.json.get("img")
    if logo and not allowed_filetype(logo.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "logo": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    if img and not allowed_filetype(img.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "img": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    
    name = request.json.get("name")
    adresse = request.json.get("adresse")
    plz = request.json.get("plz")
    pw = request.json.get("passwort")
    beschreibung = request.json.get("beschreibung")
    new_resto = Restaurant(email=email, name=name, adresse=adresse, plz=plz, beschreibung=beschreibung)
    new_resto.set_passwort(pw)
    if logo:
        uploaded_filename = logo.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(logo.get("image_data")))
        new_resto.logo = filename
    if img:
        uploaded_filename = img.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(img.get("image_data")))
        new_resto.img = filename
    db.session.add(new_resto)
    db.session.commit()
    # automatically login the restaurant by generating the access token
    access_token = create_access_token(identity=email, additional_claims={"role": "restaurant"}, expires_delta=False)
    resp = {
        "status": "success",
        "data": {
            "access_token": access_token,
            "geld": new_resto.geld
        }
    }
    return resp, 201


# confirm/reject/deliver an order (as restaurant)
@app.route("/orders/<int:id>", methods=["PUT"])
@jwt_required()
def confirm_order(id):
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    bestellung = Bestellung.query.filter_by(id=id).first()
    if not bestellung:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    if bestellung.status == "in Warenkorb" or bestellung.status == "abgeschlossen"  or bestellung.status == "storniert" or bestellung.resto_id != resto.id:
        resp = {
            "status": "fail",
            "data": {
                "message": "Verbotene URL"
            }
        }
        return resp, 403
    
    action = request.json.get("action")
    if action == "bestätigen" and bestellung.status == "in Bearbeitung":
        bestellung.status = "in Zubereitung"
    elif action == "ablehnen" and bestellung.status == "in Bearbeitung":
        bestellung.status = "storniert"
        user = User.query.filter_by(id=bestellung.user_id).first()
        user.geld = round(user.geld + bestellung.total, 2)
        admin = User.query.filter_by(id=1).first()
        admin.geld = round(admin.geld - bestellung.total, 2)
    elif action == "absenden" and bestellung.status == "in Zubereitung":
        bestellung.status = "abgeschlossen"
        resto.geld = round(resto.geld + bestellung.total * 0.85, 2)
        admin = User.query.filter_by(id=1).first()
        admin.geld = round(admin.geld - bestellung.total * 0.85, 2)
    else:
        resp = {
            "status": "fail",
            "data": {
                "message": "Action kann nicht durchgeführt werden"
            }
        }
        return resp, 403
    
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld
        }
    }
    return resp, 200


@app.route("/restaurants/profile", methods=["GET"])
@jwt_required()
def profile_restaurant():
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    resp = {
        "status": "success",
        "data": {
            "email": resto.email,
            "name": resto.name,
            "adresse": resto.adresse,
            "plz": resto.plz,
            "beschreibung": resto.beschreibung,
            "img_url": "http://127.0.0.1:5000/static/img/" + (resto.img if resto.img else "placeholder.png"),
            "logo_url": "http://127.0.0.1:5000/static/img/" + (resto.logo if resto.logo else "placeholder.png"),
            "geld": resto.geld,
            "mo_von": resto.mo_von,
            "mo_bis": resto.mo_bis,
            "di_von": resto.di_von,
            "di_bis": resto.di_bis,
            "mi_von": resto.mi_von,
            "mi_bis": resto.mi_bis,
            "do_von": resto.do_von,
            "do_bis": resto.do_bis,
            "fr_von": resto.fr_von,
            "fr_bis": resto.fr_bis,
            "sa_von": resto.sa_von,
            "sa_bis": resto.sa_bis,
            "so_von": resto.so_von,
            "so_bis": resto.so_bis,
            "lieferradius": [
                lr.plz for lr in Lieferradius.query.filter_by(resto_id=resto.id).all()
            ]
        }
    }
    return resp, 200


@app.route("/restaurants/profile", methods=["PUT"])
@jwt_required()
def update_profile_restaurant():
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    data = request.json
    email_check = Restaurant.query.filter_by(email=data.get("email")).all()
    if len(email_check) > 1 or (len(email_check) == 1 and email_check[0].id != resto.id):
        resp = {
            "status": "fail",
            "data": {
                "email": "Die E-Mail-Adresse wird bereits verwendet"
            }
        }
        return resp, 409
    resto.email = data.get("email")
    resto.name = data.get("name")
    resto.adresse = data.get("adresse")
    resto.plz = data.get("plz")
    resto.beschreibung = data.get("beschreibung")
    if data.get("passwort") != "":
        resto.set_passwort(data.get("passwort"))
    
    # check if uploaded img and logo is of allowed type
    logo = request.json.get("logo")
    img = request.json.get("img")
    if logo and not allowed_filetype(logo.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "logo": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    if img and not allowed_filetype(img.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "img": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    
    if logo:
        if resto.logo != None:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], resto.logo))
        uploaded_filename = logo.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(logo.get("image_data")))
        resto.logo = filename
    if img:
        if resto.img != None:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], resto.img))
        uploaded_filename = img.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(img.get("image_data")))
        resto.img = filename
    
    resto.mo_von = data.get("mo_von")
    resto.mo_bis = data.get("mo_bis")
    resto.di_von = data.get("di_von")
    resto.di_bis = data.get("di_bis")
    resto.mi_von = data.get("mi_von")
    resto.mi_bis = data.get("mi_bis")
    resto.do_von = data.get("do_von")
    resto.do_bis = data.get("do_bis")
    resto.fr_von = data.get("fr_von")
    resto.fr_bis = data.get("fr_bis")
    resto.sa_von = data.get("sa_von")
    resto.sa_bis = data.get("sa_bis")
    resto.so_von = data.get("so_von")
    resto.so_bis = data.get("so_bis")
    
    for old_lr in Lieferradius.query.filter_by(resto_id=resto.id).all():
        if old_lr.plz not in data.get("lieferradius"):
            db.session.delete(old_lr)
    
    new_lrs = []
    for new_lr in data.get("lieferradius"):
        if not Lieferradius.query.filter_by(resto_id=resto.id, plz=new_lr).first():
            new_lrs.append(Lieferradius(resto_id=resto.id, plz=new_lr))
    db.session.add_all(new_lrs)
    
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld
        }
    }
    return resp, 200


@app.route("/restaurants/menu", methods=["GET"])
@jwt_required()
def get_menu():
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    items = [
        {
            "id": i.id,
            "name": i.name,
            "preis": i.preis,
            "beschreibung": i.beschreibung,
            "img_url": "http://127.0.0.1:5000/static/img/" + (i.img if i.img else "placeholder.png")
        } for i in Item.query.filter_by(resto_id=resto.id).all()
    ]
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld,
            "items": items
        }
    }
    return resp, 200


@app.route("/restaurants/menu", methods=["POST"])
@jwt_required()
def add_menu():
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    item = Item(resto_id=resto.id, name=request.json.get("name"), preis=request.json.get("preis"), beschreibung=request.json.get("beschreibung"))
    img = request.json.get("img")
    if img and not allowed_filetype(img.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "img": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    if img:
        uploaded_filename = img.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(img.get("image_data")))
        item.img = filename
    db.session.add(item)
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld,
            "item_id": item.id
        }
    }
    return resp, 201


@app.route("/restaurants/menu/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_menu(id):
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    item = Item.query.filter_by(id=id).first()
    if not item:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    if item.resto_id != resto.id:
        resp = {
            "status": "fail",
            "data": {
                "message": "Verbotene URL"
            }
        }
        return resp, 403
    
    if item.img:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], item.img))
    db.session.delete(item)
    
    # deleting items still inside baskets, so that they can't be ordered
    bestellte_items_to_delete = (
        db.session.query(BestellteItem)
        .join(Bestellung)
        .filter(
            BestellteItem.item_id == id,
            Bestellung.status == "in Warenkorb"
        )
        .all()
    )
    for bestellte_item in bestellte_items_to_delete:
        bestellung = bestellte_item.bestellung
        bestellung.total = round(bestellung.total - bestellte_item.preis * bestellte_item.anzahl, 2)
        db.session.delete(bestellte_item)
    
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld
        }
    }
    return resp, 200


@app.route("/restaurants/menu/<int:id>", methods=["PUT"])
@jwt_required()
def update_menu(id):
    role = get_jwt()["role"]
    if role != "restaurant":
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige URL"
            }
        }
        return resp, 404
    email = get_jwt_identity()
    resto = Restaurant.query.filter_by(email=email).first()
    item = Item.query.filter_by(id=id).first()
    if not item:
        resp = {
            "status": "fail",
            "data": {
                "message": "Ungültige ID"
            }
        }
        return resp, 404
    if item.resto_id != resto.id:
        resp = {
            "status": "fail",
            "data": {
                "message": "Verbotene URL"
            }
        }
        return resp, 403
    
    item.name = request.json.get("name")
    item.preis = request.json.get("preis")
    item.beschreibung = request.json.get("beschreibung")
    img = request.json.get("img")
    if img and not allowed_filetype(img.get("filename")):
        resp = {
            "status": "fail",
            "data": {
                "img": "Ungültige Dateityp!"
            }
        }
        return resp, 400
    if img:
        if item.img != None:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], item.img))
        uploaded_filename = img.get("filename")
        filename = f"{uuid.uuid4().hex}_{secure_filename(uploaded_filename)}"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb") as image_file:
            image_file.write(base64.b64decode(img.get("image_data")))
        item.img = filename

    # deleting items still inside baskets, so that they can't be ordered
    bestellte_items_to_delete = (
        db.session.query(BestellteItem)
        .join(Bestellung)
        .filter(
            BestellteItem.item_id == id,
            Bestellung.status == "in Warenkorb"
        )
        .all()
    )
    for bestellte_item in bestellte_items_to_delete:
        bestellung = bestellte_item.bestellung
        bestellung.total = round(bestellung.total - bestellte_item.preis * bestellte_item.anzahl, 2)
        db.session.delete(bestellte_item)
    
    db.session.commit()
    resp = {
        "status": "success",
        "data": {
            "geld": resto.geld
        }
    }
    return resp, 200


# handling restaurant authentication for NOTIFICATION when placing new order
# '''
@socketio.on('connect')
def handle_connect():
    print("A client connected")
    
    
@socketio.on('authenticate')
def handle_authentication(data):
    token = data.get('access_token')
    if not token:
        emit('unauthorized', {'message': 'Kein Token angegeben'})
        return

    try:
        # decode the JWT token
        decoded_token = decode_token(token)
        email = decoded_token.get("sub")  # get the 'identity' (email) from the token
        role = decoded_token.get("role")  # get the role from additional claims
        if not Restaurant.query.filter_by(email=email).first() or role != "restaurant":
            emit("unauthorized", {"message": "Verboten"})
            return
        join_room(email)
        restaurant_rooms[email] = request.sid
        emit('authenticated', {'message': 'Authentication erfolgreich'})
        print(f"Restaurant with email {email} authenticated")
        
    except Exception as e:
        emit('unauthorized', {'message': 'Authentication unerfolgreich'})
        print(f"Authentication error: {e}")


@socketio.on('disconnect')
def handle_disconnect():
    for resto_email, sid in restaurant_rooms.items():
        if sid == request.sid:
            del restaurant_rooms[resto_email]
            print(f"Restaurant with email {resto_email} disconnected")
            break
    print(restaurant_rooms)
# '''


if __name__ == '__main__':
    socketio.run(app, debug=True)