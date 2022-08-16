from flask import Blueprint, Response, json, request
from flask_cors import cross_origin
from werkzeug.security import check_password_hash, generate_password_hash

from . import db
from .constants import PASSWORD_HASH, RESPONSE_STATUS
from .models import AbstractUser
from .utils import auth_required

reset = Blueprint("reset", __name__)


@reset.route("/admin/auth/reset", methods=["POST"])
@cross_origin(origin="*")
@auth_required(check_token=False, gen_token_on_error=False, reset=True, reset_val=1, check_user_status=False)
def reset_password_step_1(token_payload) -> Response:
    # user supplied their email
    # front requests the user's secret question to ask them
    email = request.get_json().get("email")
    user = AbstractUser.query.filter_by(email=email).first()
    if not user:
        return Response(
            json.dumps({"error": "No account exists for this email address."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    return Response(
        json.dumps({"secret_question": user.secret_question, "user_id": user.user_id}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@reset.route("/admin/auth/reset/sec", methods=["POST"])
@cross_origin(origin="*")
@auth_required(reset=True, reset_val=2, check_user_status=False)
def reset_password_step_2(token_payload):
    # user supplied response to their secret question
    answer = request.get_json().get("secret_answer")
    if answer is None:
        return Response(
            json.dumps({"success": False, "error": "Please answer your security question to continue."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    user_id = request.get_json().get("user_id")
    if int(user_id) != int(token_payload.get("user_id")):
        return Response(
            json.dumps({"error": f"User IDs do not match: {user_id} vs {token_payload.get('user_id')}."}),
            status=RESPONSE_STATUS["UNAUTHORIZED"],
            mimetype="application/json",
        )

    user = AbstractUser.query.filter_by(user_id=user_id).first()
    if not check_password_hash(user.secret_answer_hash, answer):
        return Response(
            json.dumps({"success": False, "error": "Incorrect answer. Please try again."}),
            status=RESPONSE_STATUS["UNAUTHORIZED"],
            mimetype="application/json",
        )

    return Response(
        json.dumps({"success": True, "user_id": user.user_id}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@reset.route("/admin/auth/reset", methods=["PATCH"])
@cross_origin(origin="*")
@auth_required(gen_token=False, reset=True, reset_val=3, check_user_status=False)
def reset_password_step_3(token_payload) -> Response:
    # user now updating their password
    new_password = request.get_json().get("new_password")
    confirm_password = request.get_json().get("confirm_password")
    if not new_password:
        return Response(
            json.dumps({"error": "Please enter your new password."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    if not confirm_password:
        return Response(
            json.dumps({"error": "Please confirm your password."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    if new_password != confirm_password:
        return Response(
            json.dumps({"error": "Passwords do not match."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    user_id = request.get_json().get("user_id")
    if int(user_id) != int(token_payload.get("user_id")):
        return Response(
            json.dumps({"error": "User IDs do not match."}),
            status=RESPONSE_STATUS["UNAUTHORIZED"],
            mimetype="application/json",
        )

    user = db.session.query(AbstractUser).filter_by(user_id=user_id).first()
    user.password_hash = generate_password_hash(new_password, PASSWORD_HASH)
    db.session.commit()

    return Response(
        json.dumps({"success": True}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
