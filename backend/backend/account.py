from flask import Blueprint, json, jsonify, request
from flask.wrappers import Response
from flask_cors import cross_origin
from werkzeug.security import check_password_hash
from wtforms import Form, StringField, validators

from . import db
from .constants import RESPONSE_STATUS, UserStatus
from .models import AbstractUser
from .utils.utils import auth_required

api = Blueprint("account_api", __name__)


@api.route("/admin/profile", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required
def account_profile(token_payload) -> Response:
    """
    Access or update user's profile

    Inputs:
    - token_payload: if auth_headers contain valid token, then return
                  decoded user information, which includes user_id,
                  login role and token. Otherwise return Response
                  with error messages

    Return:
    - Response: json, jsonify response information
    - status: int
    """
    user_id = token_payload["user_id"]

    user = AbstractUser.query.filter_by(user_id=user_id).first()

    if request.method == "PATCH":
        old_profile_details = {
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        new_profile_details = request.get_json()
        updates = {**old_profile_details, **new_profile_details}
        form = UpdateProfileForm.from_json(updates)
        if not form.validate():
            return Response(
                json.dumps({"error": "Invalid inputs"}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )
        user.first_name = form.first_name.data
        user.last_name = form.last_name.data

        db.session.commit()

    info = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

    return Response(
        json.dumps({"user_info": info}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@api.route("/admin/profile", methods=["POST"])
@cross_origin(origin="*")
@auth_required(gen_token=False)
def delete_account(token_payload) -> Response:
    """
    Deleting an account

    Inputs:
    - token_payload: if auth_headers contain valid token, then return
                  decoded user information, which includes user_id,
                  login role and token. Otherwise return Response
                  with error messages

    Return:
    - Response: json, jsonify response information
    - status: int
    """
    user_id = token_payload["user_id"]
    status = token_payload["status"]
    user = AbstractUser.query.filter(
        AbstractUser.user_id == user_id,
        AbstractUser.status != UserStatus.inactive
    ).first()

    passwd = request.get_json().get('password')

    if not check_password_hash(user.password_hash, passwd):
        return Response(
            json.dumps({"error": "Password is incorrect."}),
            status=RESPONSE_STATUS["FORBIDDEN"],
            mimetype="application/json",
        )

    # set roles to be false
    if status == UserStatus.online_tenant.value:
        user.tenant = False
    elif status == UserStatus.online_manager.value:
        user.manager = False
    elif status == UserStatus.online_owner.value:
        user.owner = False

    user.status = UserStatus.offline
    db.session.commit()

    return Response(
        json.dumps({"message": "success"}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


class UpdateProfileForm(Form):
    first_name = StringField("first_name", [validators.Length(min=1, max=35)])
    last_name = StringField("last_name", [validators.Length(min=1, max=35)])
