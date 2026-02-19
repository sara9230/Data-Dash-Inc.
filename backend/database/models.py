from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role     = db.Column(db.String(20), nullable=False)  # "customer", "driver", or "admin"

class Store(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80))  # e.g. "Pizza", "Sushi"

class MenuItem(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    price    = db.Column(db.Float, nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)

class Order(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    status      = db.Column(db.String(50), default='pending')  # pending → accepted → delivered
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    store_id    = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)
    driver_id   = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)