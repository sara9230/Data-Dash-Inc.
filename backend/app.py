# ============================================================
# backend/app.py
#
# This is the main Flask server file.
# It defines all the API "routes" — URLs that the
# React frontend can call to get or send data.
#
# Each @app.route(...) is one endpoint (URL).
# ============================================================

from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime
from flask_cors import CORS
from database.models import db, User, Store, MenuItem, Order, UserCart
import json
from sqlalchemy import text
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
CORS(app)  # allow requests from the React frontend (different port)

import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + BASE_DIR + '/database/app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'menu-items')
os.makedirs(UPLOAD_DIR, exist_ok=True)

db.init_app(app)


def ensure_menu_item_image_column():
    # Lightweight migration so existing SQLite databases get the new image_url column.
    result = db.session.execute(text("PRAGMA table_info(menu_items)"))
    columns = [row[1] for row in result.fetchall()]
    if "image_url" not in columns:
        db.session.execute(text("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(500)"))
        db.session.commit()


def ensure_order_columns():
    # Keep the orders table in sync for older local databases without full migrations.
    result = db.session.execute(text("PRAGMA table_info('order')"))
    columns = [row[1] for row in result.fetchall()]

    statements = []
    if "total_price" not in columns:
        statements.append("ALTER TABLE 'order' ADD COLUMN total_price FLOAT DEFAULT 0.0")
    if "created_at" not in columns:
        statements.append("ALTER TABLE 'order' ADD COLUMN created_at DATETIME")
    if "accepted_at" not in columns:
        statements.append("ALTER TABLE 'order' ADD COLUMN accepted_at DATETIME")
    if "delivered_at" not in columns:
        statements.append("ALTER TABLE 'order' ADD COLUMN delivered_at DATETIME")

    for statement in statements:
        db.session.execute(text(statement))

    if statements:
        db.session.execute(text("UPDATE 'order' SET total_price = 0.0 WHERE total_price IS NULL"))
        db.session.execute(text("UPDATE 'order' SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
        db.session.commit()

# Create all tables when the server starts (if they don't exist yet)
with app.app_context():
    db.create_all()
    ensure_menu_item_image_column()
    ensure_order_columns()


def sanitize_cart_items(raw_items):
    if not isinstance(raw_items, list):
        return []

    sanitized = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue

        try:
            item_id = int(item.get("id"))
            price = float(item.get("price", 0))
            quantity = int(item.get("quantity", 0))
        except (TypeError, ValueError):
            continue

        if item_id <= 0 or quantity <= 0:
            continue

        store_id = item.get("store_id")
        try:
            store_id = int(store_id) if store_id is not None else None
        except (TypeError, ValueError):
            store_id = None

        sanitized.append({
            "id": item_id,
            "name": str(item.get("name") or "").strip(),
            "description": str(item.get("description") or "").strip(),
            "image_url": str(item.get("image_url") or "").strip() or None,
            "price": round(price, 2),
            "quantity": quantity,
            "store_id": store_id,
        })

    return sanitized


def is_allowed_png(filename):
    return filename.lower().endswith('.png')


# ============================================================
# GENERAL ROUTES
# ============================================================

@app.route("/")
def home():
    return jsonify({"message": "Backend is running 🚀"})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify({'message': 'File is too large. Max size is 10 MB.'}), 413


@app.route('/uploads/menu-items/<path:filename>', methods=['GET'])
def serve_menu_item_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route('/api/uploads/menu-item-image', methods=['POST'])
def upload_menu_item_image():
    file = request.files.get('image')
    if not file:
        return jsonify({'message': 'PNG image file is required'}), 400

    if not file.filename:
        return jsonify({'message': 'File name is required'}), 400

    if not is_allowed_png(file.filename):
        return jsonify({'message': 'Only .png files are allowed'}), 400

    mime_type = (file.mimetype or '').lower()
    if mime_type not in ('image/png', 'image/x-png', 'application/octet-stream'):
        return jsonify({'message': 'Only PNG images are allowed'}), 400

    head = file.stream.read(8)
    file.stream.seek(0)
    if head != b'\x89PNG\r\n\x1a\n':
        return jsonify({'message': 'Invalid PNG file'}), 400

    safe_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}-{safe_name}"
    target_path = os.path.join(UPLOAD_DIR, unique_name)
    file.save(target_path)

    public_path = f"/uploads/menu-items/{unique_name}"
    public_url = request.host_url.rstrip('/') + public_path

    return jsonify({
        'message': 'Image uploaded successfully',
        'image_url': public_url,
        'image_path': public_path,
    }), 201


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

    if user.role not in ("customer", "user", "driver"):
        return jsonify({"message": "Please sign in from your role portal"}), 403

    return jsonify({
        "token": "user-token-123",
        "username": user.username,
        "role": user.role,        # was hardcoded to "customer" — now returns the real role
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


@app.route("/api/users/<string:username>/cart", methods=["GET"])
def get_user_cart(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user.role not in ("customer", "user"):
        return jsonify({"message": "Only customers have carts"}), 403

    cart = UserCart.query.filter_by(user_id=user.id).first()
    if not cart:
        return jsonify({"store_id": None, "items": []}), 200

    try:
        items = json.loads(cart.items_json or "[]")
    except (TypeError, ValueError):
        items = []

    return jsonify({
        "store_id": cart.store_id,
        "items": sanitize_cart_items(items),
    }), 200


@app.route("/api/users/<string:username>/cart", methods=["PUT"])
def save_user_cart(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user.role not in ("customer", "user"):
        return jsonify({"message": "Only customers have carts"}), 403

    data = request.get_json() or {}

    raw_store_id = data.get("store_id")
    if raw_store_id is None:
        store_id = None
    else:
        try:
            store_id = int(raw_store_id)
        except (TypeError, ValueError):
            return jsonify({"message": "store_id must be a number or null"}), 400

    items = sanitize_cart_items(data.get("items", []))

    if store_id is not None:
        for item in items:
            if item.get("store_id") is not None and item["store_id"] != store_id:
                return jsonify({"message": "All cart items must belong to the selected store"}), 400

    cart = UserCart.query.filter_by(user_id=user.id).first()
    if not cart:
        cart = UserCart(user_id=user.id)
        db.session.add(cart)

    cart.store_id = store_id
    cart.items_json = json.dumps(items)
    db.session.commit()

    return jsonify({"message": "Cart saved", "store_id": cart.store_id, "items": items}), 200

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
@app.route("/api/orders", methods=["GET"])
def get_orders():
   
    customer_username = request.args.get('customer_username')
    
    if customer_username:
        
        customer = User.query.filter_by(username=customer_username).first()
        if not customer:
            return jsonify([]), 200
        orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    else:
        
        orders = Order.query.all()
    
    result = []
    for order in orders:
       
        store = Store.query.get(order.store_id)
        
        order_data = {
            "id":          order.id,
            "status":      order.status,
            "customer_id": order.customer_id,
            "store_id":    order.store_id,
            "store_name":  store.name if store else None,
            "driver_id":   order.driver_id,
            "total_price": order.total_price,
        }
        
        if hasattr(order, 'created_at'):
            order_data['created_at'] = order.created_at.isoformat() if order.created_at else None
        if hasattr(order, 'accepted_at'):
            order_data['accepted_at'] = order.accepted_at.isoformat() if order.accepted_at else None
        if hasattr(order, 'delivered_at'):
            order_data['delivered_at'] = order.delivered_at.isoformat() if order.delivered_at else None
        
        result.append(order_data)
    
    return jsonify(result), 200
@app.route("/api/stores/<int:store_id>/menu-items", methods=["GET"])
def get_menu_items(store_id):
    store = Store.query.get(store_id)
    if not store:
        return jsonify({"message": "Store not found"}), 404

    items = MenuItem.query.filter_by(store_id=store_id).all()
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "name": item.name,
            "description" : item.description,
            "image_url": item.image_url,
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
    image_url = str(data.get("image_url", "") or "").strip()
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
        image_url=image_url or None,
        price=price,
        store_id=store_id,
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        "message": "Menu item added successfully!",
        "id": new_item.id,
        "image_url": new_item.image_url,
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


# ------------------------------------------------------------------
# PATCH /api/stores/<store_id>/menu-items/<item_id>/image
# Updates one menu item's image URL.
# Body: { "image_url": "https://..." }
# ------------------------------------------------------------------
@app.route("/api/stores/<int:store_id>/menu-items/<int:item_id>/image", methods=["PATCH"])
def update_menu_item_image(store_id, item_id):
    item = MenuItem.query.filter_by(id=item_id, store_id=store_id).first()
    if not item:
        return jsonify({"message": "Item not found"}), 404

    data = request.get_json() or {}
    image_url = str(data.get("image_url", "") or "").strip()

    item.image_url = image_url or None
    db.session.commit()

    return jsonify({
        "message": "Item photo updated",
        "id": item.id,
        "image_url": item.image_url,
    }), 200


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
    order.accepted_at = datetime.utcnow() 
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
    order.delivered_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Order marked as delivered!"}), 200

# ============================================================
# START THE SERVER
# ============================================================

if __name__ == "__main__":
    app.run(debug=True)