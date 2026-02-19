from flask import Flask, jsonify, request
from flask_cors import CORS
from database.models import db, User, Store, MenuItem, Order

app = Flask(__name__)
CORS(app)  # allow requests from React

import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + BASE_DIR + '/database/app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return jsonify({"message": "Backend is running 🚀"})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})
@app.route("/api/user/signin",methods=["POST"])
def user_signin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username and password:
       return jsonify({"token":"user-token-123","message":"User sign-in successful"}),200
    return jsonify({"message": "Username and password are required"}), 400
@app.route("/api/admin/signin",methods=["POST"])
def admin_signin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username and password:
         return jsonify({"token":"admin-token-456","message":"Admin sign-in successful"}),200
    return jsonify({"message": "Username and password are required"}), 400

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "customer")  # default to customer if not specified

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 400

    new_user = User(username=username, password=password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registered successfully!"}), 201


if __name__ == "__main__":
    app.run(debug=True)
