# DataDash — Food Delivery App

A full-stack food delivery web app built with **React** (frontend) and **Python/Flask** (backend). Think of it like a mini DoorDash — customers browse restaurants and place orders, drivers pick them up and deliver them, and admins manage the whole platform.

---

## Who does what?

There are three types of users in this app:

- **Customer** — browses restaurants, places orders
- **Driver** — sees available orders and marks them as delivered
- **Admin** — adds or removes restaurants from the platform

---

## Tech stack

| Layer | Tool | What it does |
|---|---|---|
| Frontend | React + Vite | Builds the web pages you see |
| Routing | React Router | Lets you navigate between pages |
| Backend | Python + Flask | Handles the server and API |
| Database | SQLite | Stores all the data in a local file |

> **New to this?** React is a JavaScript library for building UIs. Flask is a lightweight Python web framework. They talk to each other through an API — one side sends requests, the other responds with data.

---

## Project structure

```
DataDash/
├── frontend/          ← Everything the user sees (React)
│   └── src/
│       ├── pages/     ← One file per screen (Login, Dashboard, etc.)
│       ├── styles/    ← CSS for each page
│       └── App.jsx    ← Sets up page routing
│
└── backend/           ← Server + database (Python/Flask)
    ├── app.py         ← All the API routes live here
    └── database/
        └── models.py  ← Defines what gets stored (Users, Stores, Orders)
```

---

## Getting started

You'll need **two terminals open at the same time** — one for the frontend, one for the backend.

### Terminal 1 — Start the backend

```bash
cd backend

# Create a virtual environment (only do this once)
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Run the server
python app.py
```

The backend starts at `http://127.0.0.1:5000`. You should see: `Backend is running 🚀`

### Terminal 2 — Start the frontend

```bash
cd frontend
npm install       # only need to do this once
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Pages

| URL | Page | Who uses it |
|---|---|---|
| `/` | Landing page | Everyone |
| `/register` | Create an account | New users |
| `/signin/user` | Log in | Customers & Drivers |
| `/signin/admin` | Admin login | Admins |
| `/driver/dashboard` | Driver dashboard | Drivers |
| `/admin/dashboard` | Admin dashboard | Admins |

---

## How a delivery works

```
Customer places order  →  status: "pending"
         ↓
Driver accepts it      →  status: "accepted"
         ↓
Driver delivers it     →  status: "delivered"
```

---

## API routes (how the frontend talks to the backend)

The app calls these URLs automatically — you don't need to use them manually. But it's useful to know what's available.

| Method | URL | What it does |
|---|---|---|
| POST | `/api/register` | Create a new account |
| POST | `/api/user/signin` | Log in as a user |
| POST | `/api/admin/signin` | Log in as admin |
| GET | `/api/stores` | Get all restaurants |
| POST | `/api/stores` | Add a restaurant (admin only) |
| DELETE | `/api/stores/:id` | Remove a restaurant (admin only) |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders/:id/accept` | Driver accepts an order |
| POST | `/api/orders/:id/deliver` | Driver marks order as delivered |

---

## Database tables

**User** — everyone with an account
```
id | username | password | role (customer / driver / admin)
```

**Store** — restaurants on the platform
```
id | name | category | address | phone | status (Open / Closed)
```

**MenuItem** — items available at each restaurant
```
id | name | price | store_id
```

**Order** — tracks each delivery from start to finish
```
id | status (pending → accepted → delivered) | customer_id | store_id | driver_id
```

---

## Common issues

**"Could not connect to the server"** — Make sure the backend terminal is running.

**`venv\Scripts\activate` fails on Windows** — Run the terminal as Administrator, or try `venv/Scripts/activate.bat`.

**Port already in use** — Something else is using port 5000 or 5173. Restart your terminals or kill the other process.

**Changes not showing up** — The frontend hot-reloads automatically, but if something looks stuck, try refreshing the browser or restarting `npm run dev`.

---

## Team

| Role | Name |
|---|---|
| Project Manager | Mohammed Abdelnaby |
| Technical Manager | Sara Ghori |
| Front-End Lead | Allen Blesson |
| Back-End Lead | Alan Damy |
| Software Quality Lead | Cindy Lin |
