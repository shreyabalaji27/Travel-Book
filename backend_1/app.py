from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------- MongoDB Setup ----------
app.config["MONGO_URI"] = "mongodb+srv://mohit:mohit@cluster0.g5norlc.mongodb.net/travelbook?retryWrites=true&w=majority"
mongo = PyMongo(app)

# ---------- Helper ----------
def clean(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ---------- TEST CONNECTION ----------
@app.route('/test')
def test_connection():
    try:
        collections = mongo.cx["travelbook"].list_collection_names()
        return jsonify({"status": "connected", "collections": collections}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ---------- USER SIGNUP ----------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"message": "Missing fields"}), 400

    email = data["email"].strip().lower()
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    hashed_pw = generate_password_hash(data["password"])
    new_user = {
        "firstName": data.get("firstName", ""),
        "lastName": data.get("lastName", ""),
        "email": email,
        "phone": data.get("phone", ""),
        "password": hashed_pw,
        "bookings": []  # store user’s bookings here
    }

    mongo.db.users.insert_one(new_user)
    return jsonify({"message": "Signup successful"}), 201


# ---------- USER LOGIN ----------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Incorrect password"}), 401

    return jsonify({
        "message": "Login successful",
        "username": user["firstName"],
        "user_id": str(user["_id"])
    }), 200




# ---------- FETCH DATA ----------
@app.route('/flights')
def get_flights():
    return jsonify([clean(f) for f in mongo.db.flights.find()])


@app.route('/trains')
def get_trains():
    return jsonify([clean(t) for t in mongo.db.trains.find()])


@app.route('/cabs')
def get_cabs():
    return jsonify([clean(c) for c in mongo.db.cabs.find()])


# ---------- BOOKING HELPERS ----------
def get_user(username):
    return mongo.db.users.find_one({"firstName": username})


# ---------- BOOK FLIGHT ----------
@app.route('/book_flight', methods=['POST'])
def book_flight():
    data = request.get_json()
    username = data.get("username")
    flight_no = data.get("flight_no")

    user = get_user(username)
    if not user:
        return jsonify({"message": "User not logged in"}), 401

    if not flight_no:
        return jsonify({"message": "Missing flight number"}), 400

    flight = mongo.db.flights.find_one({"flight_no": flight_no})
    if not flight:
        return jsonify({"message": "Flight not found"}), 404

    if flight["eco_seats"] <= 0:
        return jsonify({"message": "No seats available"}), 409

    # Reduce seat count
    mongo.db.flights.update_one({"flight_no": flight_no}, {"$inc": {"eco_seats": -1}})

    booking = {
        "type": "flight",
        "flight_no": flight_no,
        "from": flight["from"],
        "to": flight["to"],
        "departure_time": flight["departure_time"],
        "arrival_time": flight["arrival_time"],
        "price": flight["price"]
    }

    mongo.db.users.update_one({"_id": user["_id"]}, {"$push": {"bookings": booking}})
    return jsonify({"message": "Flight booked successfully"}), 201


# ---------- BOOK TRAIN ----------
@app.route('/book_train', methods=['POST'])
def book_train():
    data = request.get_json()
    username = data.get("username")

    user = get_user(username)
    if not user:
        return jsonify({"message": "User not logged in"}), 401

    booking = {"type": "train", **data}
    mongo.db.users.update_one({"_id": user["_id"]}, {"$push": {"bookings": booking}})
    return jsonify({"message": "Train booked successfully"}), 201


# ---------- BOOK CAB ----------
# ---------- BOOK CAB ----------
@app.route('/book_cab', methods=['POST'])
def book_cab():
    data = request.get_json()
    username = data.get("username")
    cab_id = data.get("cab_id")
    pickup = data.get("pickup")
    drop = data.get("drop")
    date = data.get("date")
    cab_type = data.get("cab_type")
    price_per_km = data.get("price_per_km")

    user = get_user(username)
    if not user:
        return jsonify({"message": "User not logged in"}), 401

    if not cab_id:
        return jsonify({"message": "Missing cab ID"}), 400

    cab = mongo.db.cabs.find_one({"_id": ObjectId(cab_id)})
    if not cab:
        return jsonify({"message": "Cab not found"}), 404

    # Store only meaningful info
    booking = {
        "type": "cab",
        "cab_id": cab_id,
        "cab_type": cab_type,
        "pickup": pickup,
        "drop": drop,
        "date": date,
        "price_per_km": price_per_km
    }

    mongo.db.users.update_one({"_id": user["_id"]}, {"$push": {"bookings": booking}})
    return jsonify({"message": "Cab booked successfully"}), 201


# ---------- VIEW BOOKINGS ----------
@app.route('/bookings/<username>')
def view_bookings(username):
    user = get_user(username)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.get("bookings", [])), 200


# ---------- VIEW USER BOOKINGS (fixed version) ----------
@app.route('/my_bookings')
def my_bookings():
    username = request.args.get('username', '').strip()
    if not username:
        return jsonify({"message": "Missing username"}), 400

    user = mongo.db.users.find_one({"firstName": username}, {"_id": 0, "bookings": 1})
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.get("bookings", [])), 200


# ---------- MAIN ----------
if __name__ == '__main__':
    app.run(debug=True)
