from backend import create_app, db
from backend.constants import PASSWORD_HASH, UserStatus
from backend.models import AbstractUser, Manager, Owner
from flask import json
from parameterized import parameterized
from werkzeug.security import generate_password_hash

from .conftest import TestBaseClass


class TestProfile(TestBaseClass):
    def setUp(self):
        db.create_all()
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="test@test.com",
            password_hash=generate_password_hash("test_password", PASSWORD_HASH),
            tenant=False,
            manager=True,
            owner=True,
            secret_question="Q?",
            secret_answer_hash=generate_password_hash("A", PASSWORD_HASH),
            status=UserStatus.online_manager,
        )
        manager = Manager()
        db.session.add(test_user)
        db.session.add(manager)
        db.session.commit()

    # test access profile
    def test_access_profile(self):
        self.setUp()

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()

        response = self.client.get(
            "/admin/profile",
            headers={"Authorization": "Bearer " + token},
            mimetype="application/json",
        )

        self.assert200(response)
        self.assertEqual("test@test.com", response.get_json().get("user_info").get("email"))
        self.tearDown()

    # test valid update case
    @parameterized.expand(
        [
            [{"first_name": "Hello", "last_name": "Goodbye"}, ["Hello", "Goodbye"]],
            [{"first_name": "Hello"}, ["Hello", "Last"]],
            [{"last_name": "Goodbye"}, ["First", "Goodbye"]],
        ]
    )
    def test_update_valid_profile(self, data, expected):
        self.setUp()

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()

        response = self.client.post(
            "/admin/profile",
            data=json.dumps(data),
            headers={"Authorization": "Bearer " + token},
            mimetype="application/json",
        )

        # check response
        self.assert200(response)
        assert response.get_json().get("user_info").get("first_name") == expected[0]
        assert response.get_json().get("user_info").get("last_name") == expected[1]
        assert response.get_json().get("user_info").get("email") == "test@test.com"
        # check updated db
        user = AbstractUser.query.filter_by(user_id=1).first()
        assert [user.first_name, user.last_name] == expected
        self.tearDown()

    # test invalid update case
    def test_invalid_update_profile(self):
        self.setUp()

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()

        response = self.client.post(
            "/admin/profile",
            data=json.dumps(
                {
                    "first_name": "",
                }
            ),
            headers={"Authorization": "Bearer " + token},
            mimetype="application/json",
        )

        self.assert400(response)
        self.tearDown()
