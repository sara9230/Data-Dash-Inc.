# ============================================================
# backend/database/models.py
#
# This file defines the database tables using SQLAlchemy.
# Each class = one table in the database.
# Each db.Column = one column in that table.
# ============================================================

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role     = db.Column(db.String(20), nullable=False)  # "customer", "driver", or "admin"


class UserCart(db.Model):
    __tablename__ = 'user_carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=True)
    items_json = db.Column(db.Text, nullable=False, default='[]')


class Store(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80))   # e.g. "Pizza", "Sushi"
    address  = db.Column(db.String(200))  # e.g. "123 Main St"
    phone    = db.Column(db.String(20))   # e.g. "555-0100"
    status   = db.Column(db.String(20), default="Open")  # "Open" or "Closed"


class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    price    = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)


class Order(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    status      = db.Column(db.String(50), default='pending')
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    store_id    = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)
    driver_id   = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    total_price = db.Column(db.Float, nullable=False, default=0.0)  # add this