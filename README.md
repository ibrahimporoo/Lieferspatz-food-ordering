# Zum Ausführen: 

Das Projekt besteht aus 2 Teilen, dem Backend und dem Frontend.

## Flask Backend-Server

Die Backend-Dependencies werden im <code>backend/requirements.txt</code> gespeichert.

Erste Einrichtung:
```
cd backend
pip install -r requirements.txt
```

Ab dann, im <code>backend</code>-Verzeichnis:
```
python app.py
```

Lässt es erstmal laufen ohne die API aufzurufen, bis eine Debugger-PIN im Terminal angezeigt wird.

---
### Backend API Nutzung:

Base URL: http://127.0.0.1:5000

Sofern nicht anders angegeben, sollten die Eingaben in Form von JSON erfolgen (<code>Content-Type: application/json</code>), und die Antwort wird in JSend-kompatiblem JSON erfolgen.

Um eine Anmeldung anzuzeigen, muss der Header Folgendes enthalten: <code>Authorization: Bearer <access_token></code>

Zum Testen: 
- Beispieldaten werden bereitgestellt, öffnen Sie <code>database.db</code> mit DBbrowser. Die Datenbank wird beim erneuten Start des Flask-Servers auf nur diese Beispieldaten zurückgesetzt.
- Passwörter für Restaurantkonten: securepass[id], z. B. für La Bella Pizza (id=1), lautet das Kontopasswort securepass1.
- Passwörter für Kundenkonten: user[id-1], z. B. für Anna Schmidt (id=2), lautet das Kontopasswort user1.

<b>Für Restaurants:</b> <br>
Um Benachrichtigungen zu erhalten, wenn eine neue Bestellung aufgegeben wird, verwenden Sie <code>socket.io</code>. Wenn ein Restaurant sich anmeldet, stellen Sie eine Verbindung mit <code>socket.io</code> zur Base URL her, dann senden Sie ein <code>authenticate</code>-Event und geben dabei den angegebenen <code>access_token</code> an. Wenn die Authentifizierung erfolgreich ist, wird ein <code>authenticated</code>-Event ausgegeben, andernfalls das <code>unauthorized</code>-Event. Nach erfolgreicher Authentifizierung wird bei einer neuen Bestellung ein <code>new_order</code>-Event mit dem Feld <code>id</code> der neuen Bestellung ausgelöst. Jedes vom Server gesendete Event hat auch ein Feld <code>message</code> mit Informationen.

Beispiel (noch nicht getestet):
```
npm install socket.io-client
```
```js
import { io } from "socket.io-client";

let socket;

export const connectSocket = (access_token) => {
    if (!socket) {
        socket = io("http://127.0.0.1:5000");

        // Authenticate after connection
        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
            socket.emit("authenticate", { access_token });
        });

        // Handle successful authentication
        socket.on("authenticated", (data) => {
            console.log("Authenticated:", data.message);
        });

        // Handle errors
        socket.on("unauthorized", (data) => {
            console.error("Error: ", data.message);
        });
    }
    return socket;
};

export const getSocket = () => socket;
```
```js
// example component
import { useEffect } from "react";
import { connectSocket, getSocket } from "../socket";

const RestaurantDashboard = ({ access_token }) => {
    useEffect(() => {
        const socket = connectSocket(access_token);

        // Listen for new order notifications
        socket.on('new_order', (data) => {
            alert(data.message); // Replace this with a better UI notification
        });

        // Clean up on component unmount
        return () => {
            const socketInstance = getSocket();
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [access_token]);

    return (
        <div>
            <h1>Restaurant Dashboard</h1>
            <p>Waiting for incoming orders...</p>
        </div>
    );
};

export default RestaurantDashboard;
```

---
<summary><code>GET</code> <code><b>/static/img/[filename]</b></code> <b>Bild abrufen</b></summary>

Die URL wird von der Abfrage der Restaurants oder der Speisekarte zurückgegeben, die dann als img src verwendet werden kann.

---
#### USER (KUNDEN) ROUTES

<summary><code>POST</code> <code><b>/users/login</b></code> <b>Benutzeranmeldung</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter:
-  <code>email</code>
-  <code>passwort</code>

Responses:
- 200 -> <code>access_token</code>, <code>geld</code>
- 401 -> <code>passwort</code>: Ungültige Zugangsdaten

---
<summary><code>POST</code> <code><b>/users/register</b></code> <b>Benutzerkontoerstellung</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter:
- <code>email</code>
- <code>vorname</code>
- <code>nachname</code>
- <code>passwort</code>
- <code>adresse</code>
- <code>plz</code>

Responses:
- 201 -> <code>access_token</code>, <code>geld</code>
- 409 -> <code>email</code>: E-Mail-Adresse wird bereits verwendet

---
<summary><code>GET</code> <code><b>/users/profile</b></code> <b>Profildaten des Benutzers</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 -> <code>email</code>, <code>vorname</code>, <code>nachname</code>, <code>adresse</code>, <code>plz</code>, <code>geld</code>
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden)

---
<summary><code>GET</code> <code><b>/restaurants</b></code> <b>alle Restaurants abrufen</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter: -

Responses:
- 200 -> <code>restaurants</code>: <code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>, <code>beschreibung</code>, <code>img_url</code>, <code>logo_url</code>, Öffnungszeiten für jeden Tag <code>mo</code> für Montags, <code>di</code> für Dienstags, usw.

---
<summary><code>GET</code> <code><b>/restaurants/open</b></code> <b>alle Restaurants abrufen, die geöffnet sind und an den Benutzer liefern können</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 -> <code>geld</code>, <code>restaurants</code>: <code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>, <code>beschreibung</code>, <code>img_url</code>, <code>logo_url</code>, Öffnungszeiten für jeden Tag <code>mo</code> für Montags, <code>di</code> für Dienstags, usw.
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden)

---
<summary><code>GET</code> <code><b>/restaurants/[resto_id]</b></code> <b>die Speisekarte und Details eines Restaurants abrufen</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter: -

Responses:
- 200 ->
  - <code>geld</code> (nur wenn als Benutzer angemeldet)
  - <code>restaurant</code>: <code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>, <code>beschreibung</code>, <code>img_url</code>, <code>logo_url</code>, Öffnungszeiten für jeden Tag <code>mo</code> für Montags, <code>di</code> für Dienstags, usw.
  - <code>menu</code> (eine Liste): <code>id</code>, <code>name</code>, <code>preis</code>, <code>beschreibung</code>, <code>img_url</code>
- 404 -> <code>restaurant</code> ID ist falsch

---
<summary><code>GET</code> <code><b>/baskets</b></code> <b>Übersicht über alle Warenkörbe abrufen</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 ->
  - <code>geld</code>
  - <code>baskets</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>restaurant</code> (<code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden)

---
<summary><code>GET</code> <code><b>/baskets/[basket_id]</b></code> <b>Detail eines Korbes abrufen</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 ->
  - <code>geld</code>
  - <code>basket</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>restaurant</code> (<code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>)
  - <code>items</code> (eine Liste): <code>item_id</code>, <code>name</code>, <code>preis</code>, <code>anzahl</code>
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden, oder Warenkorb gehört nicht zu angemeldeten Kunden)

---
<summary><code>PUT</code> <code><b>/baskets/[basket_id (optional)]</b></code> <b>einen Korb aktualisieren  (wenn id nicht angegeben ist, zuerst erstellen)</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter:
- <code>resto_id</code>
- <code>anmerkung</code>
- <code>total</code>
- <code>items</code>: Liste von Item Objekten mit folgenden Parametern
  - <code>item_id</code>
  - <code>name</code>
  - <code>preis</code>
  - <code>anzahl</code>

Responses:
- 200 -> <code>geld</code>, <code>basket_id</code> (e.g. um POST auf /baskets/[basket_id] zu schicken)
- 403 -> <code>message</code> (Versuch, auf eine Bestellung oder den Warenkorb einer anderen Person zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden oder angegebene ID ist falsch)

---
<summary><code>POST</code> <code><b>/baskets/[basket_id (optional)]</b></code> <b>einen Korb aktualisieren, und dann bestellen  (wenn id nicht angegeben ist, zuerst erstellen)</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter:
- <code>resto_id</code>
- <code>anmerkung</code>
- <code>total</code>
- <code>items</code>: Liste von Item Objekten mit folgenden Parametern
  - <code>item_id</code>
  - <code>name</code>
  - <code>preis</code>
  - <code>anzahl</code>

Responses:
- 200 -> <code>geld</code>, <code>bestellung_id</code>
- 403 -> <code>message</code>, <code>basket_id</code> (Versuch, auf eine Bestellung oder den Warenkorb einer anderen Person zuzugreifen, oder Bestellung kann nicht ausgeführt werden)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden oder angegebene ID ist falsch)

---
<summary><code>DELETE</code> <code><b>/baskets/[basket_id]</b></code> <b>einen Korb löschen</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 -> <code>geld</code>
- 403 -> <code>message</code> (Versuch, auf eine Bestellung oder den Warenkorb einer anderen Person zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden oder angegebene ID ist falsch)

---
<summary><code>GET</code> <code><b>/orders</b></code> <b>alle Bestellungen des Benutzers abrufen</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 -> 
  - <code>geld</code>
  - <code>orders</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>status</code>, <code>restaurant</code> (<code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden)

---
<summary><code>GET</code> <code><b>/orders/[order_id]</b></code> <b>Detail einer Bestellung abrufen</b></summary>

Anmeldung: Benötigt (user)

Eingabeparameter: -

Responses:
- 200 -> 
  - <code>geld</code>
  - <code>order</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>status</code>, <code>restaurant</code> (<code>id</code>, <code>name</code>, <code>adresse</code>, <code>plz</code>)
  - <code>items</code> (eine Liste): <code>name</code>, <code>preis</code>, <code>anzahl</code>
- 403 -> <code>message</code> (Versuch, auf eine Bestellung oder den Warenkorb einer anderen Person zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Kunden oder angegebene ID ist falsch)

---
#### RESTAURANT ROUTES

<summary><code>POST</code> <code><b>/restaurants/login</b></code> <b>Restaurantanmeldung</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter:
-  <code>email</code>
-  <code>passwort</code>

Responses:
- 200 -> <code>access_token</code>, <code>geld</code>
- 401 -> <code>passwort</code>: Ungültige Zugangsdaten

---
<summary><code>POST</code> <code><b>/restaurants/register</b></code> <b>Restaurantkontoerstellung</b></summary>

Anmeldung: Nicht benötigt

Eingabeparameter: 
- <code>email</code>, <code>name</code>, <code>passwort</code>, <code>adresse</code>, <code>plz</code>, <code>beschreibung</code>
- <code>logo</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>
- <code>img</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>

Responses:
- 200 -> <code>access_token</code>, <code>geld</code>
- 409 -> <code>email</code>: E-Mail-Adresse wird bereits verwendet
- 400 -> <code>message</code>: falscher Dateityp

---
<summary><code>GET</code> <code><b>/orders</b></code> <b>alle Bestellungen nach des Restaurants abrufen</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter: -

Responses:
- 200 -> 
  - <code>geld</code>
  - <code>orders</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>status</code>, <code>user</code> (<code>vorname</code>, <code>nachname</code>, <code>adresse</code>, <code>plz</code>)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant)

---
<summary><code>GET</code> <code><b>/orders/[order_id]</b></code> <b>Detail einer Bestellung abrufen</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter: -

Responses:
- 200 -> 
  - <code>geld</code>
  - <code>order</code>: <code>id</code>, <code>eingang</code>, <code>anmerkung</code>, <code>total</code>, <code>status</code>, <code>user</code> (<code>vorname</code>, <code>nachname</code>, <code>adresse</code>, <code>plz</code>)
  - <code>items</code> (eine Liste): <code>name</code>, <code>preis</code>, <code>anzahl</code>
- 403 -> <code>message</code> (Versuch, auf eine Bestellung oder den Warenkorb einer anderen Restaurant zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant oder angegebene ID ist falsch)

---
<summary><code>PUT</code> <code><b>/orders/[order_id]</b></code> <b>Bestellung bestätigen/ablehnen/absenden</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter:
- <code>action</code>: entweder "bestätigen", "ablehnen", "absenden"

Responses:
- 200 -> <code>geld</code>
- 403 -> <code>message</code> (Action kann nicht durchgeführt werden)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant oder angegebene ID ist falsch)

---
<summary><code>GET</code> <code><b>/restaurants/profile</b></code> <b>Profildaten des Restaurants</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter: -

Responses:
- 200 -> 
  - <code>email</code>
  - <code>name</code>
  - <code>adresse</code>
  - <code>plz</code>
  - <code>beschreibung</code>
  - <code>img_url</code>
  - <code>logo_url</code>
  - <code>geld</code>
  - <code>lieferradius</code> (Liste von PLZs)
  - Öffnungszeiten für jeden Tag der Woche: <code>mo_von</code> für die Öffnungszeit an Montagen, <code>mo_bis</code> für die Schließzeit, <code>di_von</code>, <code>di_bis</code>, usw. Die Öffnungszeiten werden als ganze Zahlen formatiert, etwa so: "17:30" -> <code>1730</code>. Die mit <code>-1</code> angegebenen Öffnungs- und Schließzeiten bedeuten, dass das Restaurant an diesem Tag geschlossen ist.
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant)

---
<summary><code>PUT</code> <code><b>/restaurants/profile</b></code> <b>Profildaten (inkl. Öffnungszeiten und Lieferradius) des Restaurants ändern</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter:
- <code>email</code>
- <code>name</code>
- <code>adresse</code>
- <code>plz</code>
- <code>beschreibung</code>
- <code>passwort</code> (wenn nicht geändert, soll die leere Zeichenkette übermitteln werden <code>""</code>)
- <code>logo</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>
- <code>img</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>
- <code>lieferradius</code> (Liste von PLZs als Strings)
- Öffnungszeiten für jeden Tag der Woche: <code>mo_von</code> für die Öffnungszeit an Montagen, <code>mo_bis</code> für die Schließzeit, <code>di_von</code>, <code>di_bis</code>, usw. Die Öffnungszeiten müssen als ganze Zahlen formatiert, etwa so: "17:30" -> <code>1730</code>. Wenn als Öffnungs- und Schließungszeit <code>-1</code> angegeben ist, gilt das Restaurant an diesem Tag als geschlossen.

Responses:
- 200 -> <code>geld</code>
- 400 -> <code>logo</code> / <code>img</code>: ungültige Dateityp
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant)
- 409 -> <code>email</code>: E-Mail-Adresse wird bereits verwendet

---
<summary><code>GET</code> <code><b>/restaurants/menu</b></code> <b>die Speisekarte des Restaurants anzeigen</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter: -

Responses:
- 200 ->
  - <code>geld</code>
  - <code>items</code> (eine Liste): <code>id</code>, <code>name</code>, <code>preis</code>, <code>beschreibung</code>, <code>img_url</code>
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant)

---
<summary><code>POST</code> <code><b>/restaurants/menu</b></code> <b>dem Menü einen Eintrag hinzufügen</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter:
- <code>name</code>
- <code>preis</code>
- <code>beschreibung</code>
- <code>img</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>

Responses:
- 201 ->
  - <code>geld</code>
  - <code>item_id</code>
- 400 -> <code>img</code>: ungültige Dateityp
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant)

---
<summary><code>DELETE</code> <code><b>/restaurants/menu/[item_id]</b></code> <b>Menu Item löschen</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter: -

Responses:
- 200 -> <code>geld</code>
- 403 -> <code>message</code> (Versuch, auf eine Item einer anderen Restaurant zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant, oder ungültige ID)

---
<summary><code>PUT</code> <code><b>/restaurants/menu/[item_id]</b></code> <b>Menu Item ändern</b></summary>

Anmeldung: Benötigt (restaurant)

Eingabeparameter:
- <code>name</code>
- <code>preis</code>
- <code>beschreibung</code>
- <code>img</code> (optional, erlaubte Dateitypen: .png, .jpg, .jpeg):
  -  <code>image_data</code>: Datei, im Base64 encodiert
  -  <code>filename</code>

Responses:
- 200 -> <code>geld</code>
- 400 -> <code>img</code>: ungültige Dateityp
- 403 -> <code>message</code> (Versuch, auf eine Item einer anderen Restaurant zuzugreifen)
- 404 -> <code>message</code> (Konto gehört nicht zu einem Restaurant, oder ungültige ID)