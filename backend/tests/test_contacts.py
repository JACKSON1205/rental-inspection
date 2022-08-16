from backend import create_app, db
from backend.constants import ROLE, UserStatus
from backend.models import AbstractUser, Contact
from flask import json
from parameterized import parameterized

from .conftest import TestBaseClass


class TestContact(TestBaseClass):
    def setUp(self):
        db.create_all()
        test_usrs = [
            AbstractUser(
                first_name="First",
                last_name="Last",
                email="test@test.com",
                password_hash="test_password",
                tenant=False,
                manager=True,
                owner=False,
                status=UserStatus.online_manager,
            ),
            AbstractUser(
                first_name="tenant",
                last_name="32",
                email="tenant@test.com",
                password_hash="test_password",
                tenant=True,
                manager=False,
                owner=False,
            ),
            AbstractUser(
                first_name="tenant2",
                last_name="3",
                email="tenant@test.com",
                password_hash="test_password",
                tenant=True,
                manager=False,
                owner=False,
            ),
            Contact(
                tenant=True,
                owner=False,
                phone_number="0444444444",
                email="testcontact@test.com",
                user_id=2,
                manager_id=1,
                preferred_name="tenant1",
            ),
            Contact(
                tenant=True,
                owner=False,
                phone_number="0444554444",
                email="testcontact1@test.com",
                user_id=3,
                manager_id=1,
                preferred_name="tenant2",
            ),
        ]

        for usr in test_usrs:
            db.session.add(usr)
        db.session.commit()

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()
        self.headers = {"Authorization": "Bearer " + token}

    # test access profile
    def test_get_contacts(self):
        self.setUp()
        response = self.client.get(
            "/admin/contacts",
            headers=self.headers,
            mimetype="application/json",
        )

        self.assert200(response)
        self.tearDown()

    # test valid update case
    def test_update_contacts(self):
        self.setUp()

        response = self.client.patch(
            "/admin/contacts/2",
            data=json.dumps(
                {
                    "phone_number": "0444244444",
                    "mgr_id": 1,
                    "contact_id": 2,
                }
            ),
            headers=self.headers,
            mimetype="application/json",
        )

        self.assert200(response)
        contact = Contact.query.filter_by(manager_id=1, contact_id=2).first()
        assert contact.phone_number == "0444244444"
        self.tearDown()

    @parameterized.expand(
        [
            [
                {
                    "phone_number": "044434444",
                    "contact_id": 2,
                }
            ],
            [
                {
                    "phone_number": "044k444444",
                    "contact_id": 2,
                }
            ],
        ]
    )
    # test invalid update case
    def test_update_invalid_contact(self, request_dict):
        self.setUp()

        response = self.client.post(
            "/admin/contacts", data=json.dumps(request_dict), headers=self.headers, mimetype="application/json"
        )

        self.assert400(response)
        self.tearDown()
