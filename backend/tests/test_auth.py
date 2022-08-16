from operator import ge

import pytest
from backend import create_app, db
from backend.constants import PASSWORD_HASH, UserStatus
from backend.models import AbstractUser, Manager, Owner, Tenant
from flask import json
from parameterized import parameterized
from werkzeug.security import generate_password_hash

from .conftest import TestBaseClass


class TestRegister(TestBaseClass):
    # test 400 response if not all fields are supplied
    @parameterized.expand(
        [
            [
                {
                    "last_name": "Last",
                    "email": "email@email.com",
                    "password": "123",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "email": "email@email.com",
                    "password": "123",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "password": "123",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": "email@email.com",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": "email@email.com",
                    "password": "123",
                    "owner": False,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": "email@email.com",
                    "password": "123",
                    "tenant": True,
                    "owner": False,
                }
            ],
            [
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": "email@email.com",
                    "password": "123",
                    "tenant": True,
                    "manager": False,
                }
            ],
            [
                {
                    "first_name": None,
                    "last_name": "Last",
                    "email": "email@email.com",
                    "password": "123",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ],
        ]
    )
    def test_register_post_missing_fields(self, request_dict):
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(request_dict),
            mimetype="application/json",
        )
        self.assert400(response)
        self.assertIn(b"Please supply values for all fields.", response.data)

    # test 400 response for no selected role
    def test_register_post_no_role_selected(self):
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": "test@test.com",
                    "password": "123",
                    "securityQuestion": "What is another meaning of life, the universe, and everything?",
                    "securityAnswer": "Cool Hat",
                    "tenant": False,
                    "owner": False,
                    "manager": False,
                }
            ),
            mimetype="application/json",
        )
        self.assert400(response)
        self.assertIn(
            b"At least one of tenant, manager, or owner must be selected for account creation.", response.data
        )

    # test 400 response for invalid email address
    @parameterized.expand(
        [
            ["invalid_email"],
            ["invalid_email@gmail"],
            ["first/last@yahoo.com"],
        ]
    )
    def test_register_post_invalid_email(self, email):
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(
                {
                    "first_name": "First",
                    "last_name": "Last",
                    "email": email,
                    "password": "123",
                    "securityQuestion": "What is another meaning of life, the universe, and everything?",
                    "securityAnswer": "Cool Hat",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ),
            mimetype="application/json",
        )
        self.assert400(response)
        self.assertIn(b"Invalid email address.", response.data)

    # test 403 response if user already in db
    def test_register_post_email_already_exists(self):
        self.setUp()
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="test@test.com",
            password_hash="test_password",
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash="42",
            tenant=False,
            manager=True,
            owner=False,
        )
        db.session.add(test_user)
        db.session.commit()

        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(
                {
                    "first_name": "Second",
                    "last_name": "Last",
                    "email": "test@test.com",
                    "password": "123",
                    "securityQuestion": "What is another meaning of life, the universe, and everything?",
                    "securityAnswer": "Cool Hat",
                    "tenant": True,
                    "owner": False,
                    "manager": False,
                }
            ),
            mimetype="application/json",
        )
        self.assert403(response)
        self.assertIn(b"An account already exists with this email address.", response.data)
        self.tearDown()

    # test 200 response for valid account creation
    def test_register_post_valid_account(self):
        self.setUp()
        user_data = {
            "first_name": "Second",
            "last_name": "Last",
            "email": "test@test.com",
            "password": "123",
            "securityQuestion": "What is another meaning of life, the universe, and everything?",
            "securityAnswer": "Cool Hat",
            "tenant": True,
            "owner": False,
            "manager": False,
        }
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(user_data),
            mimetype="application/json",
        )
        self.assert200(response)
        token = response.get_json().get("token")
        assert AbstractUser.decode_auth_token(token) == {"user_id": 1, "status": 0}  # user id, status
        self.tearDown()

    def test_register_post_increment_user_id(self):
        self.setUp()
        user1_data = {
            "first_name": "Second",
            "last_name": "Last",
            "email": "test1@test.com",
            "password": "123",
            "securityQuestion": "What is the meaning of life, the universe, and everything?",
            "securityAnswer": "42",
            "tenant": True,
            "owner": False,
            "manager": False,
        }
        user2_data = {
            "first_name": "Second",
            "last_name": "Last",
            "email": "test2@test.com",
            "password": "123",
            "securityQuestion": "What is another meaning of life, the universe, and everything?",
            "securityAnswer": "Cool Hat",
            "tenant": True,
            "owner": False,
            "manager": False,
        }
        self.client.post(
            "/admin/auth/register",
            data=json.dumps(user1_data),
            mimetype="application/json",
        )
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(user2_data),
            mimetype="application/json",
        )
        self.assert200(response)
        token = response.get_json().get("token")
        assert AbstractUser.decode_auth_token(token) == {"user_id": 2, "status": 0}
        self.tearDown()

    # test manager table updated
    def test_register_post_manager_account(self):
        self.setUp()
        user_data = {
            "first_name": "Second",
            "last_name": "Last",
            "email": "test@test.com",
            "password": "123",
            "securityQuestion": "What is another meaning of life, the universe, and everything?",
            "securityAnswer": "Cool Hat",
            "tenant": True,
            "owner": True,
            "manager": True,
        }
        response = self.client.post(
            "/admin/auth/register",
            data=json.dumps(user_data),
            mimetype="application/json",
        )
        self.assert200(response)
        token = response.get_json().get("token")
        assert AbstractUser.decode_auth_token(token) == {"user_id": 1, "status": 0}  # user id, status
        assert Manager.query.filter_by(manager_id=1).count() == 1
        assert Owner.query.filter_by(manager_id=1).count() == 0
        assert Tenant.query.filter_by(manager_id=1).count() == 0
        self.tearDown()

    def test_register_2_valid_mgr_email(self):
        # setup
        self.setUp()
        test_manager = AbstractUser(
            first_name="Mr",
            last_name="Manager",
            email="manager@email.com",
            password_hash=generate_password_hash("password", PASSWORD_HASH),
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash=generate_password_hash("42", PASSWORD_HASH),
            tenant=False,
            manager=True,
            owner=False,
            status=UserStatus.offline,
        )
        test_mgr = Manager(
            manager_id=1,
        )
        db.session.add(test_mgr)
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="user@email.com",
            password_hash="test_password",
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash="42",
            tenant=True,
            manager=False,
            owner=True,
            status=UserStatus.offline,
        )
        db.session.add_all([test_manager, test_user])
        db.session.commit()
        token = test_user.encode_auth_token()

        # test
        response = self.client.post(
            "/admin/auth/register/mgr_select",
            headers={"Authorization": "Bearer " + token},
            data=json.dumps({"mgrEmail": "manager@email.com"}),
            mimetype="application/json",
        )
        self.assert200(response)
        token = response.get_json().get("token")
        assert AbstractUser.decode_auth_token(token) == {"user_id": 2, "status": 0}  # user id, status
        assert Manager.query.filter_by().count() == 1
        assert Owner.query.filter_by(owner_id=2).count() == 1
        assert Owner.query.filter_by(manager_id=1).count() == 1
        assert Tenant.query.filter_by(tenant_id=2).count() == 1
        assert Tenant.query.filter_by(manager_id=1).count() == 1

        self.tearDown()


class TestLogin(TestBaseClass):
    role_dict = {
        (1, 0, 0): "tenant",
        (0, 1, 0): "owner",
        (0, 0, 1): "manager",
    }

    @parameterized.expand(
        [
            [True, False, False, 1],
            [False, True, False, 2],
            [False, False, True, 3],
        ]
    )
    def test_login_correctness(self, tenant: bool, owner: bool, manager: bool, status: int):
        self.setUp()
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="user@email.com",
            password_hash=generate_password_hash("password", PASSWORD_HASH),
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash=generate_password_hash("42", PASSWORD_HASH),
            tenant=tenant,
            manager=mgr,
            owner=owner,
        )
        db.session.add(test_user)
        db.session.commit()

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(
                {"email": "user@email.com", "password": "password", "role": self.role_dict[(tenant, owner, mgr)]}
            ),
            mimetype="application/json",
        )
        print(response.get_json())
        self.assert200(response)
        data = response.get_json()
        assert data.get("userID") == 1
        token = data.get("token")
        AbstractUser.decode_auth_token(token) == {"user_id": 1, "status": status}  # user id, logged in as owner
        self.tearDown()

    @parameterized.expand(
        [
            [{"password": "password", "role": role_dict[(1, 0, 0)]}, b"Please supply an email address for login."],
            [{"email": "email@email.com", "role": role_dict[(1, 0, 0)]}, b"Please supply a password for login."],
        ]
    )
    def test_login_missing_values(self, response_dict, error_msg):
        self.setUp()

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(response_dict),
            mimetype="application/json",
        )
        self.assert400(response)
        self.assertIn(error_msg, response.data)
        self.tearDown()

    def test_login_no_existing_email(self):
        self.setUp()

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(
                {
                    "email": "email@email.com",
                    "password": "password",
                    "role": "manager",
                }
            ),
            mimetype="application/json",
        )
        self.assert403(response)
        self.assertIn(b"No account exists for this email address.", response.data)
        self.tearDown()

    def test_login_incorrect_role(self):
        self.setUp()
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="user@email.com",
            password_hash=generate_password_hash("password", PASSWORD_HASH),
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash=generate_password_hash("42", PASSWORD_HASH),
            tenant=True,
            manager=False,
            owner=False,
        )
        db.session.add(test_user)
        db.session.commit()

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(
                {
                    "email": "user@email.com",
                    "password": "password",
                    "role": "owner",
                }
            ),
            mimetype="application/json",
        )
        print(response.get_json())
        self.assert403(response)
        self.assertIn(b"This account is not linked to the role of owner, please select a new role.", response.data)

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(
                {
                    "email": "user@email.com",
                    "password": "password",
                    "role": "manager",
                }
            ),
            mimetype="application/json",
        )
        print(response.get_json())
        self.assert403(response)
        self.assertIn(b"This account is not linked to the role of manager, please select a new role.", response.data)
        self.tearDown()

    def test_login_incorrect_password(self):
        self.setUp()
        test_user = AbstractUser(
            first_name="First",
            last_name="Last",
            email="user@email.com",
            password_hash=generate_password_hash("password", PASSWORD_HASH),
            secret_question="What is the meaning of life, the universe, and everything?",
            secret_answer_hash=generate_password_hash("42", PASSWORD_HASH),
            tenant=True,
            manager=False,
            owner=False,
        )
        db.session.add(test_user)
        db.session.commit()

        response = self.client.post(
            "/admin/auth/login",
            data=json.dumps(
                {
                    "email": "user@email.com",
                    "password": "not_my_password",
                    "role": "tenant",
                }
            ),
            mimetype="application/json",
        )
        print(response.get_json())
        self.assert403(response)
        self.assertIn(b"Password is incorrect.", response.data)
