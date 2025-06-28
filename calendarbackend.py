from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from flask import send_from_directory


app = Flask(__name__)
CORS(app)  # Allow cross-origin requests, adapt for production


# Configure MongoDB client - update this to your MongoDB connection string
client = MongoClient("mongodb://localhost:27017/")
db = client["HandyManyApp"]
bookings_collection = db["bookings"]


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:  # Catch specific exception
        return None


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon'
    )


@app.route("/availability", methods=["GET"])
def availability():
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Missing 'date' query param"}), 400


    date_obj = parse_date(date_str)
    if not date_obj:
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400


    # Find bookings for the date
    bookings = list(bookings_collection.find({"date": date_str}))  # Convert cursor to list
    booked_slots = [b["time"] for b in bookings]


    # All possible time slots (same as frontend)
    all_slots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
    ]


    available_slots = [slot for slot in all_slots if slot not in booked_slots]


    return jsonify({"date": date_str, "available_slots": available_slots})


@app.route("/bookings", methods=["POST"])
def create_booking():
    # Get JSON data from the request
    data = request.get_json()


    # Validate required fields
    required_fields = [
        "name",
        "email",
        "phone",
        "address",
        "serviceType",
        "date",
        "time",
    ]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400


    # Validate date format
    if not parse_date(data["date"]):
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400


    # Check if time slot is already booked for the date
    existing = bookings_collection.find_one(
        {"date": data["date"], "time": data["time"]}
    )
    if existing:
        return jsonify({"error": "Time slot already booked for this date"}), 409


    # Create booking object
    booking = {
        "name": data["name"],
        "email": data["email"],
        "phone": data["phone"],
        "address": data["address"],
        "serviceType": data["serviceType"],
        "notes": data.get("notes", ""),
        "date": data["date"],
        "time": data["time"],
        "status": "Pending",  # New status field
        "created_at": datetime.utcnow(),
    }


    # Insert booking into the database
    bookings_collection.insert_one(booking)


    return jsonify({"message": "Booking successful", "booking": booking}), 201


@app.route("/bookings", methods=["GET"])
def get_bookings():
    bookings = list(bookings_collection.find({}, {"_id": 0}))  # Exclude _id from results
    return jsonify({"bookings": bookings})


# Endpoint to update booking status
@app.route("/bookings/<booking_id>/status", methods=["PATCH"])
def update_booking_status(booking_id):
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ["Pending", "In Progress", "Completed"]:
        return jsonify({"error": "Invalid status value"}), 400

    result = bookings_collection.update_one(
        {"_id": booking_id},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Booking not found"}), 404

    return jsonify({"message": "Booking status updated"}), 200


# Notification collection
notifications_collection = db["notifications"]


# Endpoint to get notifications for a user (by email)
@app.route("/notifications", methods=["GET"])
def get_notifications():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    notifications = list(notifications_collection.find({"email": email, "read": False}, {"_id": 0}))
    return jsonify({"notifications": notifications})


# Endpoint to create a notification
@app.route("/notifications", methods=["POST"])
def create_notification():
    data = request.get_json()
    required_fields = ["email", "message", "type"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    notification = {
        "email": data["email"],
        "message": data["message"],
        "type": data["type"],  # e.g., booking, reminder
        "read": False,
        "created_at": datetime.utcnow()
    }
    notifications_collection.insert_one(notification)
    return jsonify({"message": "Notification created"}), 201


# Endpoint to mark notification as read
@app.route("/notifications/<notification_id>/read", methods=["PATCH"])
def mark_notification_read(notification_id):
    result = notifications_collection.update_one(
        {"_id": notification_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Notification not found"}), 404

    return jsonify({"message": "Notification marked as read"}), 200


# Endpoint to get upcoming bookings for reminders (e.g., next day)
@app.route("/reminders", methods=["GET"])
def get_reminders():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    today = datetime.utcnow().date()
    next_day = today + timedelta(days=1)
    reminders = list(bookings_collection.find({
        "email": email,
        "date": next_day.strftime("%Y-%m-%d"),
        "status": {"$in": ["Pending", "In Progress"]}
    }, {"_id": 0}))
    return jsonify({"reminders": reminders})


from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from flask import send_from_directory
from bson.objectid import ObjectId


app = Flask(__name__)
CORS(app)  # Allow cross-origin requests, adapt for production


# Configure MongoDB client - update this to your MongoDB connection string
client = MongoClient("mongodb://localhost:27017/")
db = client["handymanyapp"]
bookings_collection = db["bookings"]
notifications_collection = db["notifications"]


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:  # Catch specific exception
        return None


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon'
    )


@app.route("/availability", methods=["GET"])
def availability():
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Missing 'date' query param"}), 400


    date_obj = parse_date(date_str)
    if not date_obj:
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400


    # Find bookings for the date
    bookings = list(bookings_collection.find({"date": date_str}))  # Convert cursor to list
    booked_slots = [b["time"] for b in bookings]


    # All possible time slots (same as frontend)
    all_slots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
    ]


    available_slots = [slot for slot in all_slots if slot not in booked_slots]


    return jsonify({"date": date_str, "available_slots": available_slots})


@app.route("/bookings", methods=["POST"])
def create_booking():
    # Get JSON data from the request
    data = request.get_json()


    # Validate required fields
    required_fields = [
        "name",
        "email",
        "phone",
        "address",
        "serviceType",
        "date",
        "time",
    ]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400


    # Validate date format
    if not parse_date(data["date"]):
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400


    # Check if time slot is already booked for the date
    existing = bookings_collection.find_one(
        {"date": data["date"], "time": data["time"]}
    )
    if existing:
        return jsonify({"error": "Time slot already booked for this date"}), 409


    # Create booking object
    booking = {
        "name": data["name"],
        "email": data["email"],
        "phone": data["phone"],
        "address": data["address"],
        "serviceType": data["serviceType"],
        "notes": data.get("notes", ""),
        "date": data["date"],
        "time": data["time"],
        "status": "Pending",  # New status field
        "created_at": datetime.utcnow(),
    }


    # Insert booking into the database
    bookings_collection.insert_one(booking)


    return jsonify({"message": "Booking successful", "booking": booking}), 201


@app.route("/bookings", methods=["GET"])
def get_bookings():
    bookings = list(bookings_collection.find({}, {"_id": 0}))  # Exclude _id from results
    return jsonify({"bookings": bookings})


# Endpoint to update booking status
@app.route("/bookings/<booking_id>/status", methods=["PATCH"])
def update_booking_status(booking_id):
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ["Pending", "In Progress", "Completed"]:
        return jsonify({"error": "Invalid status value"}), 400

    try:
        obj_id = ObjectId(booking_id)
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    result = bookings_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Booking not found"}), 404

    return jsonify({"message": "Booking status updated"}), 200


# Endpoint to get notifications for a user (by email)
@app.route("/notifications", methods=["GET"])
def get_notifications():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    notifications = list(notifications_collection.find({"email": email, "read": False}, {"_id": 1, "email": 1, "message": 1, "type": 1, "read": 1, "created_at": 1}))
    for n in notifications:
        n["_id"] = str(n["_id"])
    return jsonify({"notifications": notifications})


# Endpoint to create a notification
@app.route("/notifications", methods=["POST"])
def create_notification():
    data = request.get_json()
    required_fields = ["email", "message", "type"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    notification = {
        "email": data["email"],
        "message": data["message"],
        "type": data["type"],  # e.g., booking, reminder
        "read": False,
        "created_at": datetime.utcnow()
    }
    notifications_collection.insert_one(notification)
    return jsonify({"message": "Notification created"}), 201


# Endpoint to mark notification as read
@app.route("/notifications/<notification_id>/read", methods=["PATCH"])
def mark_notification_read(notification_id):
    try:
        obj_id = ObjectId(notification_id)
    except:
        return jsonify({"error": "Invalid notification ID"}), 400

    result = notifications_collection.update_one(
        {"_id": obj_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Notification not found"}), 404

    return jsonify({"message": "Notification marked as read"}), 200


# Endpoint to get upcoming bookings for reminders (e.g., next day)
@app.route("/reminders", methods=["GET"])
def get_reminders():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    today = datetime.utcnow().date()
    next_day = today + timedelta(days=1)
    reminders = list(bookings_collection.find({
        "email": email,
        "date": next_day.strftime("%Y-%m-%d"),
        "status": {"$in": ["Pending", "In Progress"]}
    }, {"_id": 0}))
    return jsonify({"reminders": reminders})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)  # Make sure to run on a different port
