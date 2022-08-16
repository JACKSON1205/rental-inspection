import io

from backend import create_app, db
from backend.constants import ROLE, UserStatus
from backend.models import AbstractUser, Property
from flask import json
from parameterized import parameterized
from werkzeug.datastructures import FileStorage

from .conftest import TestBaseClass


class TestProperties(TestBaseClass):
    def setUp(self):
        db.create_all()
        dummy_db = [
            AbstractUser(
                first_name="First",
                last_name="Last",
                email="test_manager@test.com",
                password_hash="test_password",
                tenant=False,
                manager=True,
                owner=False,
                user_id=1,
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
                user_id=2,
            ),
            AbstractUser(
                first_name="tenant2",
                last_name="3",
                email="tenant@test.com",
                password_hash="test_password",
                tenant=True,
                manager=False,
                owner=False,
                user_id=3,
            ),
            AbstractUser(
                first_name="owner",
                last_name="3",
                email="owner@test.com",
                password_hash="test_password",
                tenant=False,
                manager=False,
                owner=True,
                user_id=4,
                status=UserStatus.online_owner,
            ),
            AbstractUser(
                first_name="owner2",
                last_name="3",
                email="owner2@test.com",
                password_hash="test_password",
                tenant=False,
                manager=False,
                owner=True,
                user_id=5,
            ),
            Property(
                address="street abc",
                post_code=2033,
                map_lat=12345678.666666,
                map_long=12345678.666666,
                leased=True,
                manager_id=1,
                owner_id=4,
                tenant_id=2,
            ),
            Property(
                address="street b",
                post_code=2032,
                map_lat=12345678.666666,
                map_long=12345678.666666,
                leased=True,
                owner_id=5,
            ),
            Property(
                address="street c",
                post_code=2031,
                map_lat=12345678.666666,
                map_long=12345678.666666,
                leased=True,
                manager_id=1,
                owner_id=5,
                tenant_id=3,
            ),
        ]

        for dummy in dummy_db:
            db.session.add(dummy)
        db.session.commit()

    def test_add_new_property(self):
        self.create_app()
        user = AbstractUser.query.filter_by(user_id=4).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}

        data = {
            "address": "UNSW, Sydney, AU",
            "post_code": "2033",
            "leased": False,
        }
        import os

        print(os.listdir("./data/"))
        my_file = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data["image"] = my_file
        response = self.client.post("/admin/properties", data=data, mimetype="multipart/form-data", headers=headers)
        import base64

        self.assert200(response)
        res = json.loads(response.data.decode("ascii").replace("'", '"'))
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()
        assert prop.address == data["address"]
        assert str(prop.post_code) == data["post_code"]
        assert prop.leased == data["leased"]

    def test_update_property(self):
        self.create_app()
        user = AbstractUser.query.filter_by(user_id=4).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}

        data = {
            "address": "UNSW, Sydney, AU",
            "post_code": "2033",
            "leased": False,
        }
        my_file = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data["image"] = my_file
        response = self.client.post("/admin/properties", data=data, mimetype="multipart/form-data", headers=headers)
        import base64
        import os
        from os.path import join, isfile
        
        onlyfiles = [f for f in os.listdir("./data/") if isfile(join("./data/", f))]
        print(onlyfiles)
        self.assert200(response)
        res = json.loads(response.data.decode("ascii").replace("'", '"'))
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()
        prop.manager_id = 1
        db.session.commit()

        testfile = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data = {
            "leased": True,
            "tenant_email": "tenant@test.com",
            "image": testfile,
            "lease_expiration_date": "12/20/2021",
        }

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}
        response = self.client.patch(
            "/admin/properties/" + str(res["property"]["property_id"]),
            data=data,
            mimetype="multipart/form-data",
            headers=headers,
        )
        self.assert200(response)        
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()
        tenant = AbstractUser.query.filter_by(email=data["tenant_email"]).first()
        assert prop.tenant_id == tenant.user_id
        assert prop.leased == data["leased"]
        data = {
            "leased": False,
        }

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}
        response = self.client.patch(
            "/admin/properties/" + str(res["property"]["property_id"]),
            data=data,
            mimetype="multipart/form-data",
            headers=headers,
        )
        self.assert200(response) 
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}
        response = self.client.get(
            "/admin/properties/" + str(res["property"]["property_id"]),
            headers=headers,
        )
        res = json.loads(response.data.decode("ascii").replace("'", '"'))
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()

    def test_get_property_list(self):
        self.create_app()
        user = AbstractUser.query.filter_by(user_id=4).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}

        data = {
            "address": "UNSW, Sydney, AU",
            "post_code": "2033",
            "leased": False,
        }
        import os
        from os.path import join, isfile
        
        
        onlyfiles = [f for f in os.listdir("./data/") if isfile(join("./data/", f))]
        print(onlyfiles)
        my_file = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data["image"] = my_file
        response = self.client.post("/admin/properties", data=data, mimetype="multipart/form-data", headers=headers)
        token = json.loads(response.data.decode("ascii").replace("'", '"'))["token"]
        headers = {"Authorization": "Bearer " + token}
        response = self.client.get("/admin/properties", headers=headers)
        self.assert200(response)
        

    def test_get_property_list_patch(self):
        self.create_app()
        user = AbstractUser.query.filter_by(user_id=4).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}

        data = {
            "address": "UNSW, Sydney, AU",
            "post_code": "2033",
            "leased": False,
        }
        import os
        from os.path import join, isfile
        
        onlyfiles = [f for f in os.listdir("./data/") if isfile(join("./data/", f))]
        print(onlyfiles)
        my_file = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data["image"] = my_file
        response = self.client.post("/admin/properties", data=data, mimetype="multipart/form-data", headers=headers)
        token = json.loads(response.data.decode("ascii").replace("'", '"'))["token"]
        headers = {"Authorization": "Bearer " + token}
        response = self.client.patch(
            "/admin/properties",
            data=json.dumps({
            "owner_email": "owner@test.com", 
            "leased":True
            }),
            headers=headers,
            mimetype="application/json",
        )

        self.assert200(response)


    def test_property_details_get(self):
        self.create_app()
        user = AbstractUser.query.filter_by(user_id=4).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}

        data = {
            "address": "UNSW, Sydney, AU",
            "post_code": "2033",
            "leased": False,
        }
        my_file = FileStorage(open("./data/test.jpeg", "rb"), "test.jpeg")
        data["image"] = my_file
        response = self.client.post("/admin/properties", data=data, mimetype="multipart/form-data", headers=headers)
        import base64

        self.assert200(response)
        res = json.loads(response.data.decode("ascii").replace("'", '"'))
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()

        user = AbstractUser.query.filter_by(user_id=1).first()
        token = user.encode_auth_token()
        headers = {"Authorization": "Bearer " + token}
        response = self.client.get(
            "/admin/properties/" + str(res["property"]["property_id"]),
            headers=headers,
        )
        self.assert200(response)
        prop = Property.query.filter_by(property_id=res["property"]["property_id"]).first()
        assert prop.leased == data["leased"]