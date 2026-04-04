# ============================================================
# backend/app.py
#
# This is the main Flask server file.
# It defines all the API "routes" — URLs that the
# React frontend can call to get or send data.
#
# Each @app.route(...) is one endpoint (URL).
# ============================================================

from flask import Flask, jsonify, request
from flask_cors import CORS
from database.models import db, User, Store, MenuItem, Order

app = Flask(__name__)
CORS(app)  # allow requests from the React frontend (different port)

import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + BASE_DIR + '/database/app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create all tables when the server starts (if they don't exist yet)
with app.app_context():
    db.create_all()


# ============================================================
# GENERAL ROUTES
# ============================================================

@app.route("/")
def home():
    return jsonify({"message": "Backend is running 🚀"})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ============================================================
# AUTH ROUTES
# ============================================================

# POST /api/user/signin
# Body: { "username": "...", "password": "..." }
# Returns: a token if successful
@app.route("/api/user/signin", methods=["POST"])
def user_signin():
    data     = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"message": "Invalid username or password"}), 401

    if user.role not in ("customer", "user"):
        return jsonify({"message": "Please sign in from your role portal"}), 403

    return jsonify({
        "token": "user-token-123",
        "username": user.username,
        "role": "customer",
        "message": "User sign-in successful",
    }), 200

# POST /api/admin/signin
# Body: { "username": "...", "password": "..." }
# Returns: a token if successful
@app.route("/api/admin/signin", methods=["POST"])
def admin_signin():
    data     = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username and password:
        return jsonify({"token": "admin-token-456", "message": "Admin sign-in successful"}), 200
    return jsonify({"message": "Username and password are required"}), 400


# POST /api/register
# Body: { "username": "...", "password": "...", "role": "customer" }
# Creates a new user in the database
@app.route("/api/register", methods=["POST"])
def register():
    data     = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role     = data.get("role", "customer")  # default to "customer" if not provided

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    if role not in ("customer", "driver", "admin"):
        return jsonify({"message": "Invalid role"}), 400

    # Check if that username is already taken
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 400

    new_user = User(username=username, password=password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registered successfully!"}), 201

# ============================================================
# STORE (RESTAURANT) ROUTES
# These are used by the Admin Dashboard
# ============================================================

# ------------------------------------------------------------------
# GET /api/stores
# Returns a list of ALL stores in the database.
# The frontend calls this when the admin dashboard loads.
# ------------------------------------------------------------------
@app.route("/api/stores", methods=["GET"])
def get_stores():
    stores = Store.query.all()  # fetch every row from the Store table

    # Convert each Store object into a plain dictionary so we can send it as JSON
    result = []
    for store in stores:
        result.append({
            "id":       store.id,
            "name":     store.name,
            "category": store.category,
            "address":  store.address,
            "phone":    store.phone,
            "status":   store.status
        })

    return jsonify(result), 200


# ------------------------------------------------------------------
# GET /api/stores/<id>/menu-items
# Returns menu items for one store.
# ------------------------------------------------------------------
@app.route("/api/stores/<int:store_id>/menu-items", methods=["GET"])
def get_store_menu_items(store_id):
    store = Store.query.get(store_id)
    if not store:
        return jsonify({"message": "Store not found"}), 404

    menu_items = MenuItem.query.filter_by(store_id=store_id).order_by(MenuItem.name.asc()).all()
    result = []
    for item in menu_items:
        result.append({
            "id": item.id,
            "name": item.name,
            "description" : item.description,
            "price": float(item.price),
            "store_id": item.store_id,
        })

    return jsonify(result), 200


# ------------------------------------------------------------------
# POST /api/stores/<store_id>/menu-items
# Adds a new menu item to a store.
# Body: { "name": "...", "description": "...", "price": 9.99 }
# ------------------------------------------------------------------
@app.route("/api/stores/<int:store_id>/menu-items", methods=["POST"])
def add_menu_item(store_id):
    store = Store.query.get(store_id)
    if not store:
        return jsonify({"message": "Store not found"}), 404

    data = request.get_json() or {}

    name = data.get("name")
    description = data.get("description", "")
    price = data.get("price")

    if not name:
        return jsonify({"message": "Item name is required"}), 400
    if price is None:
        return jsonify({"message": "Price is required"}), 400

    try:
        price = float(price)
    except (TypeError, ValueError):
        return jsonify({"message": "Price must be a number"}), 400

    new_item = MenuItem(
        name=name,
        description=description,
        price=price,
        store_id=store_id,
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        "message": "Menu item added successfully!",
        "id": new_item.id
    }), 201


# ------------------------------------------------------------------
# POST /api/stores
# Adds a NEW store to the database.
# Body: { "name": "...", "category": "...", "address": "...", "phone": "...", "status": "Open" }
# ------------------------------------------------------------------
@app.route("/api/stores", methods=["POST"])
def add_store():
    data = request.get_json()

    # Make sure the required fields are present
    name = data.get("name")
    if not name:
        return jsonify({"message": "Store name is required"}), 400

    new_store = Store(
        name     = name,
        category = data.get("category", ""),
        address  = data.get("address", ""),
        phone    = data.get("phone", ""),
        status   = data.get("status", "Open")
    )

    db.session.add(new_store)    # stage the new row
    db.session.commit()          # save it to the database

    return jsonify({
        "message": "Store added successfully!",
        "id":      new_store.id  # send back the new ID so the frontend can use it
    }), 201


# ------------------------------------------------------------------
# DELETE /api/stores/<id>
# Deletes the store with the given ID.
# Example: DELETE /api/stores/3  →  deletes store with id=3
# ------------------------------------------------------------------
@app.route("/api/stores/<int:store_id>", methods=["DELETE"])
def delete_store(store_id):
    # Try to find the store — if it doesn't exist, return 404
    store = Store.query.get(store_id)

    if not store:
        return jsonify({"message": "Store not found"}), 404

    db.session.delete(store)  # mark it for deletion
    db.session.commit()        # save the change

    return jsonify({"message": f'"{store.name}" was deleted successfully'}), 200


# ------------------------------------------------------------------
# DELETE /api/stores/<store_id>/menu-items/<item_id>
# Deletes a menu item belonging to a specific store.
# ------------------------------------------------------------------
@app.route("/api/stores/<int:store_id>/menu-items/<int:item_id>", methods=["DELETE"])
def delete_menu_item(store_id, item_id):
    item = MenuItem.query.filter_by(id=item_id, store_id=store_id).first()
    if not item:
        return jsonify({"message": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": f'"{item.name}" was deleted successfully'}), 200


# ============================================================
# ORDER ROUTES (used by Driver Dashboard)
# ============================================================

# POST /api/orders
# Customer creates a new order
# Body: { "store_id": 1, "customer_username": "alice" }
# Alternate body: { "store_id": 1, "customer_id": 2 }
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json() or {}

    store_id = data.get("store_id")
    if store_id is None:
        return jsonify({"message": "store_id is required"}), 400

    try:
        store_id = int(store_id)
    except (TypeError, ValueError):
        return jsonify({"message": "store_id must be a number"}), 400

    store = Store.query.get(store_id)
    if not store:
        return jsonify({"message": "Store not found"}), 404
    if (store.status or "").lower() != "open":
        return jsonify({"message": "This store is currently closed"}), 400

    customer = None
    customer_id = data.get("customer_id")
    customer_username = data.get("customer_username")

    if customer_id is not None:
        try:
            customer_id = int(customer_id)
        except (TypeError, ValueError):
            return jsonify({"message": "customer_id must be a number"}), 400
        customer = User.query.get(customer_id)
    elif customer_username:
        customer = User.query.filter_by(username=customer_username).first()
    else:
        return jsonify({"message": "Provide customer_id or customer_username"}), 400

    if not customer:
        return jsonify({"message": "Customer not found"}), 404
    if customer.role not in ("customer", "user"):
        return jsonify({"message": "Only customers can place orders"}), 403

    new_order = Order(
    status="pending",
    customer_id=customer.id,
    store_id=store.id,
    driver_id=None,
    total_price=data.get("total_price", 0.0),  # add this
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        "message": "Order placed successfully!",
        "order_id": new_order.id,
        "status": new_order.status,
    }), 201

# GET /api/orders
# Returns all orders (drivers use this to see pending ones)
@app.route("/api/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    result = []
    for order in orders:
        # Look up the store name for a friendlier display
        store = Store.query.get(order.store_id)
        result.append({
            "id":          order.id,
            "status":      order.status,
            "customer_id": order.customer_id,
            "store_id":    order.store_id,
            "store_name":  store.name if store else None,
            "driver_id":   order.driver_id,
        })
    return jsonify(result), 200


# POST /api/orders/<id>/accept
# Driver accepts a pending order
# Body: { "driver_id": 1 }
@app.route("/api/orders/<int:order_id>/accept", methods=["POST"])
def accept_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    if order.status != "pending":
        return jsonify({"message": "Order is no longer available"}), 400

    data = request.get_json()
    driver_id = data.get("driver_id")
    if not driver_id:
        return jsonify({"message": "driver_id is required"}), 400

    order.status    = "accepted"
    order.driver_id = driver_id
    db.session.commit()

    return jsonify({"message": "Order accepted!"}), 200


# POST /api/orders/<id>/deliver
# Driver marks an order as delivered
@app.route("/api/orders/<int:order_id>/deliver", methods=["POST"])
def deliver_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    if order.status != "accepted":
        return jsonify({"message": "Order must be accepted before marking delivered"}), 400

    order.status = "delivered"
    db.session.commit()

    return jsonify({"message": "Order marked as delivered!"}), 200

# ============================================================
# START THE SERVER
# ============================================================

if __name__ == "__main__":
    app.run(debug=True)