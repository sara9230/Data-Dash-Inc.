import unittest
import os
import sys

# Add the backend folder to Python's path so this file can import app.py
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from app import app
from database.models import db, User

class TestRegisterRoute(unittest.TestCase):
    """
    This test class focuses only on the /api/register route.

    The task list is: 
    Task 1: Capture username, password, and role from the request
    Task 2: Validate required fields (username and password)
    Task 3: Validate the role
    Task 4: Check if username already exists
    Task 5: Create and store the user
    """

    # preparing and cleaning the enviroment 
    def setUp(self):
        """
        This will run before each test. 

        It sets the Flask app into testing mode, creates a test client,
        allowing us to send fake HTTP requests and resets the database tables
        so every test starts clean.
        """
        app.config["TESTING"] = True
        self.client = app.test_client()

        with app.app_context():
            db.drop_all()
            db.create_all()

    def tearDown(self):
        """
        Runs after each test.

        Clears the database after each test so tests do not affect
        each other.
        """
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # test that checks that a user can successfully register
    # captures username, password and role. succesfully creates and stores the user
    def test_register_success(self):
        """
        Tests Task 1 and Task 5:
        - Capture valid username, password, and role from the request
        - Create and store the new user successfully


        This test sends a valid registration request and checks that:
        - the backend returns status code 201
        - the success message is correct
        - the user was actually added to the database
        """
        response = self.client.post("/api/register", json={
            "username": "cindy",
            "password": "1234",
            "role": "customer"
        })


        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["message"], "Registered successfully!")


        with app.app_context():
            user = User.query.filter_by(username="cindy").first()
            self.assertIsNotNone(user)
            self.assertEqual(user.role, "customer")


if __name__ == "__main__":
    unittest.main()