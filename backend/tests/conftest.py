import os

from backend import create_app, db
from flask_testing import TestCase


class TestBaseClass(TestCase):
    def create_app(self):
        app = create_app()
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
        app.config["TESTING"] = True

        # dummy secret_key for token operation
        app.config["SECRET_KEY"] = os.environ.get("PMS_SECRET_KEY")
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
