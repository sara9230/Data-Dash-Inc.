import unittest
import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from app import app
from database.models import db, User, Store

class TestOrderRoutes(unittest.TestCase):
    """
    This test class focuses on validation for the /api/orders route.

    Task 1: Capture store_id from the request
    Task 2: Validate that store_id is provided
    Task 3: Validate that the store exists
    Task 4: Validate that the store is open
    """

    def setUp(self):
        """
        Runs before every test.

        This sets the app into testing mode, creates a test client,
        and resets the database so each test starts with a clean state.
        """
        app.config["TESTING"] = True
        self.client = app.test_client()

        with app.app_context():
            db.drop_all()
            db.create_all()

            # Create a customer user for testing order requests
            customer = User(
                username="cindy",
                password="1234",
                role="customer"
            )

            # Create one open store for testing
            store = Store(
                name="Pizza Place",
                category="Italian",
                address="123 Main St",
                phone="555-1111",
                status="Open"
            )

            db.session.add(customer)
            db.session.add(store)
            db.session.commit()

            # Save only the IDs so we can safely use them later
            self.customer_id = customer.id
            self.store_id = store.id

    def tearDown(self):
        """
        Runs after every test.

        This clears the database after each test so tests stay independent.
        """
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # test to check that backend will reject order if there is no store selected 
    def test_create_order_missing_store_id(self):
        """
        Tests Task 2:
        - Validate that store_id is required

        This test sends an order request without store_id.
        The backend should reject the request and return status code 400.
        """
        response = self.client.post("/api/orders", json={
            "customer_id": self.customer_id
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["message"], "store_id is required")

    # test that the backend will reject an order when the store does not exist 
    def test_create_order_store_not_found(self):
        """
        Tests Task 3:
        - Validate that the store exists

        This test sends an order request with a store_id that does not exist.
        The backend should reject the request and return status code 404.
        """
        response = self.client.post("/api/orders", json={
            "store_id": 999,
            "customer_id": self.customer_id
        })

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["message"], "Store not found")

    # test that the backend rejects an order if the store is closed 
    def test_create_order_store_closed(self):
        """
        Tests Task 4:
        - Validate that the store is open

        This test changes the store status to Closed and then tries to place
        an order. The backend should reject the request and return status code 400.
        """
        with app.app_context():
            store = Store.query.get(self.store_id)
            store.status = "Closed"
            db.session.commit()

        response = self.client.post("/api/orders", json={
            "store_id": self.store_id,
            "customer_id": self.customer_id
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["message"], "This store is currently closed")


if __name__ == "__main__":
    unittest.main()