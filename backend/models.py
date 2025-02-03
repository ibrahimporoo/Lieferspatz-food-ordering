from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw

# initialize SQLAlchemy instance
db = SQLAlchemy()

# define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    passwort = db.Column(db.String(200), nullable=False)
    vorname = db.Column(db.String(50), nullable=False)
    nachname = db.Column(db.String(50), nullable=False)
    adresse = db.Column(db.String(100), nullable=False)
    plz = db.Column(db.String(8), nullable=False)
    geld = db.Column(db.Float, default=100, nullable=False)
    
    def set_passwort(self, pw):
        self.passwort = hashpw(pw.encode('utf-8'), gensalt())
    def check_passwort(self, pw):
        return checkpw(pw.encode('utf-8'), self.passwort)
    
class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    passwort = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    adresse = db.Column(db.String(100), nullable=False)
    plz = db.Column(db.String(8), nullable=False)
    beschreibung = db.Column(db.Text, default="")
    img = db.Column(db.String(200))
    logo = db.Column(db.String(200))
    geld = db.Column(db.Float, default=0, nullable=False)
    mo_von = db.Column(db.Integer, default=0, nullable=False)
    mo_bis = db.Column(db.Integer, default=2359, nullable=False)
    di_von = db.Column(db.Integer, default=0, nullable=False)
    di_bis = db.Column(db.Integer, default=2359, nullable=False)
    mi_von = db.Column(db.Integer, default=0, nullable=False)
    mi_bis = db.Column(db.Integer, default=2359, nullable=False)
    do_von = db.Column(db.Integer, default=0, nullable=False)
    do_bis = db.Column(db.Integer, default=2359, nullable=False)
    fr_von = db.Column(db.Integer, default=0, nullable=False)
    fr_bis = db.Column(db.Integer, default=2359, nullable=False)
    sa_von = db.Column(db.Integer, default=0, nullable=False)
    sa_bis = db.Column(db.Integer, default=2359, nullable=False)
    so_von = db.Column(db.Integer, default=0, nullable=False)
    so_bis = db.Column(db.Integer, default=2359, nullable=False)
    
    def set_passwort(self, pw):
        self.passwort = hashpw(pw.encode('utf-8'), gensalt())
    def check_passwort(self, pw):
        return checkpw(pw.encode('utf-8'), self.passwort)
    
class Lieferradius(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resto_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    plz = db.Column(db.String(8), nullable=False)
    
    resto = db.relationship('Restaurant', backref=db.backref('lieferradien', lazy=True))
    
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resto_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    preis = db.Column(db.Float, nullable=False)
    beschreibung = db.Column(db.Text)
    img = db.Column(db.String(200))
    
class Bestellung(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    resto_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    eingang = db.Column(db.DateTime, default=datetime.now(), nullable=False)
    status = db.Column(
        Enum(
            "in Warenkorb", 
            "in Bearbeitung", 
            "in Zubereitung", 
            "storniert", 
            "abgeschlossen",
            name="status_enum"
        ),
        default="in Warenkorb",
        nullable=False)
    anmerkung = db.Column(db.Text)
    total = db.Column(db.Float, nullable=False)
    
    bestellte_items = db.relationship('BestellteItem', backref='bestellung', cascade="all, delete-orphan")
    
class BestellteItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, nullable=False)
    bestellung_id = db.Column(db.Integer, db.ForeignKey('bestellung.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    preis = db.Column(db.Float, nullable=False)
    anzahl = db.Column(db.Integer, nullable=False)
    
    
# populate with sample data
def populate_sample():
    sample = [    
        # some user, admin, restaurant geld are changed to reflect bestellungen
        # admin (to store lieferspatz geld)
        User(email="admin@lieferspatz.de", passwort=hashpw("1234".encode('utf-8'), gensalt()), vorname="Admin", nachname="Konto", adresse="Forthausweg 2, Duisburg", plz="47057", geld=37.19),
        
        # restaurants
        Restaurant(email="info@labellapizza.com", passwort=hashpw("securepass1".encode('utf-8'), gensalt()), name="La Bella Pizza", adresse="Hauptstraße 10, Berlin", plz="10115", beschreibung="Italienisches Restaurant mit Pizza.", logo="labellapizza.jpeg", geld=29.58, mo_von=0, mo_bis=2359, di_von=0, di_bis=2359, mi_von=0, mi_bis=2359, do_von=0, do_bis=2359, fr_von=0, fr_bis=2359, sa_von=0, sa_bis=2359, so_von=0, so_bis=2359),
        Restaurant(email="contact@sushitime.de", passwort=hashpw("securepass2".encode('utf-8'), gensalt()), name="Sushi Time", adresse="Bahnhofstraße 5, München", plz="80335", beschreibung="Japanisches Restaurant mit Sushi.", geld=20.82, mo_von=1130, mo_bis=2200, di_von=1130, di_bis=2200, mi_von=1130, mi_bis=2200, do_von=1130, do_bis=2200, fr_von=1130, fr_bis=2200, sa_von=1130, sa_bis=2200, so_von=1200, so_bis=2000),
        Restaurant(email="info@curryexpress.de", passwort=hashpw("securepass3".encode('utf-8'), gensalt()), name="Curry Express", adresse="Marktplatz 3, Hamburg", plz="20095", beschreibung="Indische Spezialitäten schnell serviert.", geld=47.09, mo_von=1200, mo_bis=2200, di_von=1200, di_bis=2200, mi_von=1200, mi_bis=2200, do_von=1200, do_bis=2200, fr_von=1200, fr_bis=2200, sa_von=1200, sa_bis=2200, so_von=1200, so_bis=2200),
        Restaurant(email="contact@burgerlounge.de", passwort=hashpw("securepass4".encode('utf-8'), gensalt()), name="Burger Lounge", adresse="Allee 15, Frankfurt", plz="60313", beschreibung="Gourmet-Burger aus frischen Zutaten.", geld=51.25, mo_von=1000, mo_bis=2200, di_von=1000, di_bis=2200, mi_von=1000, mi_bis=2200, do_von=1000, do_bis=2200, fr_von=1000, fr_bis=2200, sa_von=1000, sa_bis=2200, so_von=1100, so_bis=2000),
        Restaurant(email="info@veggiedelight.com", passwort=hashpw("securepass5".encode('utf-8'), gensalt()), name="Veggie Delight", adresse="Gartenweg 8, Köln", plz="50667", beschreibung="Vegetarische und vegane Spezialitäten.", geld=38.5, mo_von=1100, mo_bis=2100, di_von=1100, di_bis=2100, mi_von=1100, mi_bis=2100, do_von=1100, do_bis=2100, fr_von=1100, fr_bis=2100, sa_von=1100, sa_bis=2100, so_von=-1, so_bis=-1),
        Restaurant(email="contact@steakhousedx.de", passwort=hashpw("securepass6".encode('utf-8'), gensalt()), name="Steakhouse Deluxe", adresse="Königsstraße 22, Stuttgart", plz="70173", beschreibung="Hochwertige Steaks und Beilagen.", mo_von=1200, mo_bis=2300, di_von=1200, di_bis=2300, mi_von=1200, mi_bis=2300, do_von=1200, do_bis=2300, fr_von=1200, fr_bis=2300, sa_von=1700, sa_bis=2300, so_von=-1, so_bis=-1),
        Restaurant(email="info@pekinggarden.de", passwort=hashpw("securepass7".encode('utf-8'), gensalt()), name="Peking Garden", adresse="Hauptplatz 7, Düsseldorf", plz="40213", beschreibung="Authentische chinesische Küche.", mo_von=1130, mo_bis=2200, di_von=1130, di_bis=2200, mi_von=1130, mi_bis=2200, do_von=1130, do_bis=2200, fr_von=1130, fr_bis=2200, sa_von=1130, sa_bis=2200, so_von=1200, so_bis=2100),
        Restaurant(email="tacos@tacofiesta.de", passwort=hashpw("securepass8".encode('utf-8'), gensalt()), name="Taco Fiesta", adresse="Ringstraße 4, Leipzig", plz="04109", beschreibung="Mexikanische Tacos und mehr.", mo_von=1100, mo_bis=2000, di_von=1100, di_bis=2000, mi_von=1100, mi_bis=2000, do_von=1100, do_bis=2000, fr_von=1100, fr_bis=2000, sa_von=1200, sa_bis=2200, so_von=1200, so_bis=2200),
        Restaurant(email="contact@oceanscatch.de", passwort=hashpw("securepass9".encode('utf-8'), gensalt()), name="Ocean's Catch", adresse="Hafenstraße 12, Bremen", plz="28195", beschreibung="Fisch und Meeresfrüchte vom Feinsten.", mo_von=1200, mo_bis=2100, di_von=1200, di_bis=2100, mi_von=1200, mi_bis=2100, do_von=1200, do_bis=2100, fr_von=1200, fr_bis=2100, sa_von=1200, sa_bis=2100, so_von=1200, so_bis=2100),
        Restaurant(email="info@bavarianfeast.de", passwort=hashpw("securepass10".encode('utf-8'), gensalt()), name="Bavarian Feast", adresse="Hauptstraße 14, Berlin", plz="10115", beschreibung="Bayrische Schmankerl und Biergarten.", logo="bavarianfeast.jpeg", geld=9.77, mo_von=0, mo_bis=2300, di_von=1100, di_bis=2300, mi_von=1100, mi_bis=2300, do_von=1100, do_bis=2300, fr_von=1100, fr_bis=2300, sa_von=1100, sa_bis=2300, so_von=0, so_bis=2359),
        Restaurant(email="info@antalyakebab.com", passwort=hashpw("securepass11".encode('utf-8'), gensalt()), name="Antalya Kebab", adresse="Hauptstraße 20, Berlin", plz="10115", beschreibung="Kebabladen", logo="antalyakebab.jpeg", geld=13.6, mo_von=0, mo_bis=1700, di_von=800, di_bis=2200, mi_von=800, mi_bis=2200, do_von=800, do_bis=2200, fr_von=800, fr_bis=2200, sa_von=800, sa_bis=2200, so_von=0, so_bis=2359),
        
        # lieferradien
        Lieferradius(resto_id=1, plz="10115"),
        Lieferradius(resto_id=1, plz="10117"),
        Lieferradius(resto_id=1, plz="10119"),
        Lieferradius(resto_id=1, plz="10178"),
        Lieferradius(resto_id=1, plz="10179"),
        Lieferradius(resto_id=2, plz="80335"),
        Lieferradius(resto_id=2, plz="80336"),
        Lieferradius(resto_id=2, plz="80337"),
        Lieferradius(resto_id=2, plz="80333"),
        Lieferradius(resto_id=2, plz="80331"),
        Lieferradius(resto_id=3, plz="20095"),
        Lieferradius(resto_id=3, plz="20097"),
        Lieferradius(resto_id=3, plz="20099"),
        Lieferradius(resto_id=3, plz="20144"),
        Lieferradius(resto_id=3, plz="20146"),
        Lieferradius(resto_id=4, plz="60313"),
        Lieferradius(resto_id=4, plz="60311"),
        Lieferradius(resto_id=4, plz="60322"),
        Lieferradius(resto_id=4, plz="60323"),
        Lieferradius(resto_id=4, plz="60314"),
        Lieferradius(resto_id=5, plz="50667"),
        Lieferradius(resto_id=5, plz="50668"),
        Lieferradius(resto_id=5, plz="50670"),
        Lieferradius(resto_id=5, plz="50672"),
        Lieferradius(resto_id=5, plz="50674"),
        Lieferradius(resto_id=6, plz="70173"),
        Lieferradius(resto_id=6, plz="70174"),
        Lieferradius(resto_id=6, plz="70176"),
        Lieferradius(resto_id=6, plz="70178"),
        Lieferradius(resto_id=6, plz="70182"),
        Lieferradius(resto_id=7, plz="40213"),
        Lieferradius(resto_id=7, plz="40215"),
        Lieferradius(resto_id=7, plz="40217"),
        Lieferradius(resto_id=7, plz="40219"),
        Lieferradius(resto_id=7, plz="40221"),
        Lieferradius(resto_id=8, plz="04109"),
        Lieferradius(resto_id=8, plz="04103"),
        Lieferradius(resto_id=8, plz="04105"),
        Lieferradius(resto_id=8, plz="04107"),
        Lieferradius(resto_id=8, plz="04129"),
        Lieferradius(resto_id=9, plz="28195"),
        Lieferradius(resto_id=9, plz="28197"),
        Lieferradius(resto_id=9, plz="28199"),
        Lieferradius(resto_id=9, plz="28201"),
        Lieferradius(resto_id=9, plz="28203"),
        Lieferradius(resto_id=10, plz="10115"),
        Lieferradius(resto_id=10, plz="10117"),
        Lieferradius(resto_id=10, plz="10119"),
        Lieferradius(resto_id=10, plz="10178"),
        Lieferradius(resto_id=10, plz="10179"),
        Lieferradius(resto_id=11, plz="10115"),
        Lieferradius(resto_id=11, plz="10117"),
        Lieferradius(resto_id=11, plz="10119"),

        # items
        Item(resto_id=1, name="Margherita Pizza", preis=7.50, beschreibung="Klassische Pizza mit Tomaten, Mozzarella und Basilikum", img="margheritapizza.jpeg"),
        Item(resto_id=1, name="Spaghetti Carbonara", preis=8.90, beschreibung="Pasta mit Speck und Pecorino", img="spaghetticarbonara.jpeg"),
        Item(resto_id=1, name="Lasagne Bolognese", preis=9.50, beschreibung="Hausgemachte Lasagne mit Bolognesesauce", img="lasagnebolognese.jpeg"),
        Item(resto_id=1, name="Quattro Formaggi Pizza", preis=8.80, beschreibung="Pizza mit vier Käsesorten", img="quattroformaggipizza.jpeg"),
        Item(resto_id=1, name="Tiramisu", preis=4.50, beschreibung="Traditionelles italienisches Dessert", img="tiramisu.jpeg"),
        Item(resto_id=1, name="Caprese Salad", preis=6.00, beschreibung="Tomaten-Mozzarella-Salat mit Basilikum", img="capresesalad.jpeg"),
        Item(resto_id=1, name="Bruschetta", preis=5.00, beschreibung="Geröstetes Brot mit Tomaten und Basilikum", img="bruschetta.jpeg"),
        Item(resto_id=1, name="Penne Arrabbiata", preis=7.80, beschreibung="Scharfe Pasta mit Tomatensauce", img="pennearrabbiata.jpeg"),
        Item(resto_id=1, name="Gnocchi al Pesto", preis=8.20, beschreibung="Kartoffelgnocchi mit Basilikumpesto", img="gnocchialpesto.jpeg"),
        Item(resto_id=1, name="Espresso", preis=2.00, beschreibung="Klassischer italienischer Espresso", img="espresso.jpeg"),
        Item(resto_id=2, name="Sake Nigiri", preis=2.50, beschreibung="Frischer Lachs auf Sushi-Reis"),
        Item(resto_id=2, name="Maguro Nigiri", preis=3.00, beschreibung="Thunfisch auf Sushi-Reis"),
        Item(resto_id=2, name="California Roll", preis=6.50, beschreibung="Sushi-Rolle mit Krabbenfleisch und Avocado"),
        Item(resto_id=2, name="Ebi Tempura Roll", preis=7.00, beschreibung="Sushi-Rolle mit knuspriger Garnele"),
        Item(resto_id=2, name="Miso Soup", preis=3.50, beschreibung="Japanische Suppe mit Tofu und Seetang"),
        Item(resto_id=2, name="Tamago Nigiri", preis=2.20, beschreibung="Süßes Omelett auf Sushi-Reis"),
        Item(resto_id=2, name="Edamame", preis=4.00, beschreibung="Gedämpfte grüne Bohnen mit Meersalz"),
        Item(resto_id=2, name="Sashimi Tuna", preis=8.50, beschreibung="Dünn geschnittener roher Thunfisch"),
        Item(resto_id=2, name="Gyoza", preis=5.50, beschreibung="Japanische Teigtaschen mit Gemüsefüllung"),
        Item(resto_id=2, name="Matcha Ice Cream", preis=4.00, beschreibung="Grünes Tee-Eis"),
        Item(resto_id=3, name="Butter Chicken", preis=9.90, beschreibung="Zartes Hähnchen in cremiger Tomatensauce"),
        Item(resto_id=3, name="Tandoori Chicken", preis=8.50, beschreibung="Gewürztes gegrilltes Hähnchen"),
        Item(resto_id=3, name="Paneer Tikka Masala", preis=8.20, beschreibung="Würziger Curry mit indischem Käse"),
        Item(resto_id=3, name="Lamb Vindaloo", preis=10.50, beschreibung="Scharfes Lammcurry"),
        Item(resto_id=3, name="Biryani", preis=7.90, beschreibung="Aromatischer Reis mit Gewürzen und Gemüse"),
        Item(resto_id=3, name="Garlic Naan", preis=2.50, beschreibung="Fladenbrot mit Knoblauch"),
        Item(resto_id=3, name="Mango Lassi", preis=3.50, beschreibung="Süßes Mangogetränk"),
        Item(resto_id=3, name="Samosa", preis=3.00, beschreibung="Frittierte Teigtaschen mit Kartoffelfüllung"),
        Item(resto_id=3, name="Aloo Gobi", preis=7.00, beschreibung="Curry mit Kartoffeln und Blumenkohl"),
        Item(resto_id=3, name="Gulab Jamun", preis=4.00, beschreibung="Süße Bällchen in Zuckersirup"),
        Item(resto_id=4, name="Classic Cheeseburger", preis=6.90, beschreibung="Burger mit Käse, Tomate und Salat"),
        Item(resto_id=4, name="BBQ Bacon Burger", preis=8.50, beschreibung="Burger mit Speck und BBQ-Sauce"),
        Item(resto_id=4, name="Veggie Burger", preis=7.20, beschreibung="Burger mit Gemüsepatty"),
        Item(resto_id=4, name="Crispy Chicken Burger", preis=7.90, beschreibung="Knuspriger Hähnchenburger"),
        Item(resto_id=4, name="Sweet Potato Fries", preis=3.50, beschreibung="Süßkartoffelpommes"),
        Item(resto_id=4, name="Onion Rings", preis=3.00, beschreibung="Frittierte Zwiebelringe"),
        Item(resto_id=4, name="Caesar Salad", preis=5.50, beschreibung="Salat mit Caesar-Dressing"),
        Item(resto_id=4, name="Milkshake Vanilla", preis=4.00, beschreibung="Vanillemilchshake"),
        Item(resto_id=4, name="Milkshake Chocolate", preis=4.00, beschreibung="Schokoladenmilchshake"),
        Item(resto_id=4, name="Double Cheeseburger", preis=9.90, beschreibung="Doppelter Cheeseburger"),
        Item(resto_id=5, name="Vegan Burger", preis=8.90, beschreibung="Pflanzlicher Burger mit Gemüsepatty"),
        Item(resto_id=5, name="Avocado Toast", preis=6.50, beschreibung="Geröstetes Brot mit Avocado und Tomaten"),
        Item(resto_id=5, name="Quinoa Bowl", preis=9.00, beschreibung="Quinoa mit Gemüse und Tahini-Dressing"),
        Item(resto_id=5, name="Jackfruit Tacos", preis=7.80, beschreibung="Tacos gefüllt mit gewürzter Jackfruit"),
        Item(resto_id=5, name="Vegan Mac and Cheese", preis=8.50, beschreibung="Cremige Pasta mit veganem Käse"),
        Item(resto_id=5, name="Chia Pudding", preis=5.00, beschreibung="Chia-Samen-Dessert mit Kokosmilch"),
        Item(resto_id=5, name="Smoothie Bowl", preis=7.00, beschreibung="Smoothie-Basis mit frischen Früchten"),
        Item(resto_id=5, name="Falafel Wrap", preis=6.90, beschreibung="Wrap gefüllt mit Falafel und Hummus"),
        Item(resto_id=5, name="Vegan Brownie", preis=4.50, beschreibung="Schokoladiger Brownie ohne tierische Zutaten"),
        Item(resto_id=5, name="Matcha Latte", preis=4.20, beschreibung="Grüner Tee mit pflanzlicher Milch"),
        Item(resto_id=6, name="Ribeye Steak", preis=24.90, beschreibung="Saftiges Ribeye-Steak mit Beilage"),
        Item(resto_id=6, name="T-Bone Steak", preis=29.50, beschreibung="Großes T-Bone-Steak perfekt gegrillt"),
        Item(resto_id=6, name="Filet Mignon", preis=32.00, beschreibung="Zartes Filetstück mit Kräuterbutter"),
        Item(resto_id=6, name="New York Strip", preis=26.90, beschreibung="Klassisches Strip-Steak mit Röstaromen"),
        Item(resto_id=6, name="Caesar Salad", preis=8.50, beschreibung="Salat mit Caesar-Dressing und Croutons"),
        Item(resto_id=6, name="Grilled Vegetables", preis=6.00, beschreibung="Gemischtes Grillgemüse"),
        Item(resto_id=6, name="Loaded Baked Potato", preis=4.50, beschreibung="Gebackene Kartoffel mit Sour Cream und Speck"),
        Item(resto_id=6, name="Garlic Bread", preis=3.50, beschreibung="Knoblauchbrot"),
        Item(resto_id=6, name="Cheesecake", preis=5.50, beschreibung="Cremiger Cheesecake mit Beerensauce"),
        Item(resto_id=6, name="Chocolate Lava Cake", preis=6.50, beschreibung="Warmer Schokokuchen mit flüssigem Kern"),
        Item(resto_id=7, name="Kung Pao Chicken", preis=9.90, beschreibung="Hühnchen mit Erdnüssen und Chili"),
        Item(resto_id=7, name="Sweet and Sour Pork", preis=8.50, beschreibung="Schweinefleisch in süß-saurer Sauce"),
        Item(resto_id=7, name="Vegetable Spring Rolls", preis=4.50, beschreibung="Knusprige Frühlingsrollen mit Gemüsefüllung"),
        Item(resto_id=7, name="Beef Chow Mein", preis=9.50, beschreibung="Gebratene Nudeln mit Rindfleisch"),
        Item(resto_id=7, name="Hot and Sour Soup", preis=5.00, beschreibung="Scharfe und saure Suppe"),
        Item(resto_id=7, name="Dumplings", preis=6.50, beschreibung="Gedämpfte oder frittierte Teigtaschen"),
        Item(resto_id=7, name="Mapo Tofu", preis=8.00, beschreibung="Scharfer Tofu mit Hackfleisch"),
        Item(resto_id=7, name="Peking Duck", preis=15.90, beschreibung="Klassische Peking-Ente"),
        Item(resto_id=7, name="Fried Rice", preis=6.50, beschreibung="Gebratener Reis mit Gemüse"),
        Item(resto_id=7, name="Sesame Balls", preis=4.00, beschreibung="Süße Kugeln aus Klebreismehl"),
        Item(resto_id=8, name="Beef Tacos", preis=7.50, beschreibung="Tacos gefüllt mit Rindfleisch und Salsa"),
        Item(resto_id=8, name="Chicken Enchiladas", preis=9.00, beschreibung="Überbackene Enchiladas mit Hühnchen"),
        Item(resto_id=8, name="Nachos Supreme", preis=8.50, beschreibung="Nachos mit Käse, Jalapeños und Bohnen"),
        Item(resto_id=8, name="Guacamole", preis=5.00, beschreibung="Frische Avocadocreme mit Chips"),
        Item(resto_id=8, name="Fajitas", preis=12.00, beschreibung="Gegrilltes Fleisch mit Gemüse und Tortillas"),
        Item(resto_id=8, name="Churros", preis=6.50, beschreibung="Frittierte Teigstreifen mit Zimt und Zucker"),
        Item(resto_id=8, name="Quesadilla", preis=7.00, beschreibung="Gefüllte Tortilla mit Käse"),
        Item(resto_id=8, name="Mexican Rice", preis=4.50, beschreibung="Würziger mexikanischer Reis"),
        Item(resto_id=8, name="Taco Salad", preis=6.90, beschreibung="Salat mit Taco-Zutaten"),
        Item(resto_id=8, name="Margarita", preis=7.50, beschreibung="Klassischer Tequila-Cocktail"),
        Item(resto_id=9, name="Grilled Salmon", preis=18.90, beschreibung="Gegrillter Lachs mit Zitrone und Dill"),
        Item(resto_id=9, name="Fish and Chips", preis=12.50, beschreibung="Knusprig panierter Fisch mit Pommes"),
        Item(resto_id=9, name="Garlic Shrimp", preis=16.00, beschreibung="Garnelen in Knoblauchbutter"),
        Item(resto_id=9, name="Seafood Platter", preis=29.00, beschreibung="Gemischte Meeresfrüchteplatte"),
        Item(resto_id=9, name="Lobster Bisque", preis=9.50, beschreibung="Cremige Hummersuppe"),
        Item(resto_id=9, name="Crab Cakes", preis=14.00, beschreibung="Krabbenfrikadellen mit Dip"),
        Item(resto_id=9, name="Oysters", preis=18.00, beschreibung="Frische Austern mit Zitrone"),
        Item(resto_id=9, name="Calamari", preis=11.50, beschreibung="Frittierte Tintenfischringe"),
        Item(resto_id=9, name="Clam Chowder", preis=8.50, beschreibung="Muschelsuppe nach New-England-Art"),
        Item(resto_id=9, name="Grilled Tuna Steak", preis=22.00, beschreibung="Gegrilltes Thunfischsteak"),
        Item(resto_id=10, name="Schweinshaxe", preis=14.50, beschreibung="Traditionelle Schweinshaxe mit Knödeln", img="schweinshaxe.jpeg"),
        Item(resto_id=10, name="Weißwurst", preis=5.50, beschreibung="Klassische Weißwurst mit süßem Senf", img="weisswurst.jpeg"),
        Item(resto_id=10, name="Brezen", preis=3.00, beschreibung="Ofenfrische Brezen mit Salz", img="brezen.jpeg"),
        Item(resto_id=10, name="Käsespätzle", preis=9.00, beschreibung="Spätzle mit Käse und Röstzwiebeln", img="kaesespaetzle.jpeg"),
        Item(resto_id=10, name="Obatzda", preis=7.50, beschreibung="Käsecreme mit Brezen", img="obatzda.jpeg"),
        Item(resto_id=10, name="Apfelstrudel", preis=6.00, beschreibung="Hausgemachter Apfelstrudel mit Vanillesauce", img="apfelstrudel.jpeg"),
        Item(resto_id=10, name="Schnitzel Wiener Art", preis=12.50, beschreibung="Knusprig paniertes Schnitzel", img="schnitzelwienerart.jpeg"),
        Item(resto_id=10, name="Rostbratwurst", preis=7.00, beschreibung="Bratwurst mit Sauerkraut", img="rostbratwurst.jpeg"),
        Item(resto_id=10, name="Kartoffelsalat", preis=4.50, beschreibung="Bayerischer Kartoffelsalat", img="kartoffelsalat.jpeg"),
        Item(resto_id=10, name="Radler", preis=3.50, beschreibung="Erfrischendes Biermischgetränk", img="radler.jpeg"),
        Item(resto_id=11, name="Döner Kebab", preis=6.50, beschreibung="Fladenbrot gefüllt mit Dönerfleisch, Salat und Sauce", img="doenerkebab.jpeg"),
        Item(resto_id=11, name="Lahmacun", preis=5.00, beschreibung="Türkische Pizza mit Hackfleisch und Kräutern", img="lahmacun.jpeg"),
        Item(resto_id=11, name="Adana Kebab", preis=8.90, beschreibung="Gegrilltes Lammhackfleisch auf einem Spieß, serviert mit Reis", img="adanakebab.jpeg"),
        Item(resto_id=11, name="Iskender Kebab", preis=10.50, beschreibung="Dönerfleisch auf Fladenbrot mit Joghurt und Tomatensauce", img="iskenderkebab.jpeg"),
        Item(resto_id=11, name="Falafel", preis=5.50, beschreibung="Frittierte Bällchen aus Kichererbsen, serviert mit Hummus", img="falafel.jpeg"),
        Item(resto_id=11, name="Köfte", preis=7.50, beschreibung="Türkische Fleischbällchen mit Gewürzen, serviert mit Salat", img="koefte.jpeg"),
        Item(resto_id=11, name="Sigara Börek", preis=4.50, beschreibung="Knusprige Teigrollen gefüllt mit Schafskäse", img="sigaraborek.jpeg"),
        Item(resto_id=11, name="Pilav", preis=3.90, beschreibung="Türkischer Reis mit Butter und Gewürzen", img="pilav.jpeg"),
        Item(resto_id=11, name="Baklava", preis=4.00, beschreibung="Süßes Blätterteiggebäck mit Pistazien und Honig", img="baklava.jpeg"),
        Item(resto_id=11, name="Ayran", preis=2.50, beschreibung="Erfrischendes Joghurtgetränk", img="ayran.jpeg"),
        
        # users
        User(email="user1@example.com", passwort=hashpw("user1".encode('utf-8'), gensalt()), vorname="Anna", nachname="Schmidt", adresse="Friedrichstraße 123, Berlin", plz="10117", geld=37.7),
        User(email="user2@example.com", passwort=hashpw("user2".encode('utf-8'), gensalt()), vorname="Peter", nachname="Müller", adresse="Sendlinger Straße 45, München", plz="80331", geld=75.5),
        User(email="user3@example.com", passwort=hashpw("user3".encode('utf-8'), gensalt()), vorname="Julia", nachname="Meier", adresse="Spitalerstraße 12, Hamburg", plz="20099", geld=44.6),
        User(email="user4@example.com", passwort=hashpw("user4".encode('utf-8'), gensalt()), vorname="Lukas", nachname="Schneider", adresse="Zeil 110, Frankfurt am Main", plz="60313", geld=39.7),
        User(email="user5@example.com", passwort=hashpw("user5".encode('utf-8'), gensalt()), vorname="Sophie", nachname="Fischer", adresse="Schildergasse 20, Köln", plz="50670", geld=54.7),
        User(email="user6@example.com", passwort=hashpw("user6".encode('utf-8'), gensalt()), vorname="Maximilian", nachname="Weber", adresse="Königstraße 7, Stuttgart", plz="70176"),
        User(email="user7@example.com", passwort=hashpw("user7".encode('utf-8'), gensalt()), vorname="Marie", nachname="Becker", adresse="Königsallee 55, Düsseldorf", plz="40215"),
        User(email="user8@example.com", passwort=hashpw("user8".encode('utf-8'), gensalt()), vorname="Johannes", nachname="Hoffmann", adresse="Petersstraße 30, Leipzig", plz="04109"),
        User(email="user9@example.com", passwort=hashpw("user9".encode('utf-8'), gensalt()), vorname="Laura", nachname="Wagner", adresse="Obernstraße 85, Bremen", plz="28195"),
        User(email="user10@example.com", passwort=hashpw("user10".encode('utf-8'), gensalt()), vorname="Thomas", nachname="Schulz", adresse="Ludwigsplatz 8, Nürnberg", plz="90403"),

        # bestellungen & bestellte items
        Bestellung(user_id=2, resto_id=1, status="abgeschlossen", anmerkung="sample Bestellung 1", total=34.8),
        Bestellung(user_id=2, resto_id=10, status="abgeschlossen", anmerkung="sample Bestellung 2", total=11.5),
        Bestellung(user_id=2, resto_id=11, status="abgeschlossen", anmerkung="sample Bestellung 3", total=16),
        Bestellung(user_id=3, resto_id=2, status="abgeschlossen", total=11),
        Bestellung(user_id=3, resto_id=2, status="abgeschlossen", total=13.5),
        Bestellung(user_id=4, resto_id=3, status="abgeschlossen", total=18.4),
        Bestellung(user_id=4, resto_id=3, status="abgeschlossen", total=37),
        Bestellung(user_id=5, resto_id=4, status="abgeschlossen", total=30.8),
        Bestellung(user_id=5, resto_id=4, status="abgeschlossen", total=29.5),
        Bestellung(user_id=6, resto_id=5, status="abgeschlossen", total=27.9),
        Bestellung(user_id=6, resto_id=5, status="abgeschlossen", total=17.4),
        BestellteItem(item_id=1, bestellung_id=1, name="Margherita Pizza", preis=7.5, anzahl=1),
        BestellteItem(item_id=2, bestellung_id=1, name="Spaghetti Carbonara", preis=8.9, anzahl=2),
        BestellteItem(item_id=3, bestellung_id=1, name="Lasagne Bolognese", preis=9.5, anzahl=1),
        BestellteItem(item_id=98, bestellung_id=2, name="Rostbratwurst", preis=7, anzahl=1),
        BestellteItem(item_id=99, bestellung_id=2, name="Kartoffelsalat", preis=4.5, anzahl=1),
        BestellteItem(item_id=109, bestellung_id=3, name="Baklava", preis=4, anzahl=4),
        BestellteItem(item_id=11, bestellung_id=4, name="Sake Nigiri", preis=2.5, anzahl=2),
        BestellteItem(item_id=12, bestellung_id=4, name="Maguro Nigiri", preis=3, anzahl=2),
        BestellteItem(item_id=13, bestellung_id=5, name="California Roll", preis=6.5, anzahl=1),
        BestellteItem(item_id=14, bestellung_id=5, name="Ebi Tempura Roll", preis=7, anzahl=1),
        BestellteItem(item_id=21, bestellung_id=6, name="Butter Chicken", preis=9.9, anzahl=1),
        BestellteItem(item_id=22, bestellung_id=6, name="Tandoori Chicken", preis=8.5, anzahl=1),
        BestellteItem(item_id=29, bestellung_id=7, name="Aloo Gobi", preis=7, anzahl=3),
        BestellteItem(item_id=30, bestellung_id=7, name="Gulab Jamun", preis=4, anzahl=4),
        BestellteItem(item_id=31, bestellung_id=8, name="Classic Cheeseburger", preis=6.9, anzahl=2),
        BestellteItem(item_id=32, bestellung_id=8, name="BBQ Bacon Burger", preis=8.5, anzahl=2),
        BestellteItem(item_id=33, bestellung_id=9, name="Veggie Burger", preis=7.2, anzahl=3),
        BestellteItem(item_id=34, bestellung_id=9, name="Crispy Chicken Burger", preis=7.9, anzahl=1),
        BestellteItem(item_id=47, bestellung_id=10, name="Smoothie Bowl", preis=7, anzahl=3),
        BestellteItem(item_id=48, bestellung_id=10, name="Falafel Wrap", preis=6.9, anzahl=1),
        BestellteItem(item_id=49, bestellung_id=11, name="Vegan Brownie", preis=4.5, anzahl=2),
        BestellteItem(item_id=50, bestellung_id=11, name="Matcha Latte", preis=4.2, anzahl=2),
    ]
    db.session.add_all(sample)
    db.session.commit()    
    print("samples created")
    return