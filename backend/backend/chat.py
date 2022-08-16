from flask import Blueprint, Response, json, request
from flask_cors import cross_origin
import datetime as dt
import pytz
from . import db
from .constants import (RESPONSE_STATUS, UserStatus, ROLE)
from .models import AbstractUser, TenantRoom, OwnerRoom, TenantMessage, OwnerMessage
from .utils import auth_required

chat = Blueprint("chat", __name__)


def metatime(timestamp):
    t = dt.datetime.strptime(str(timestamp), "%Y-%m-%d %H:%M:%S.%f")
    t = t.replace(tzinfo=pytz.timezone('Australia/Sydney'))
    return t.strftime("%I:%M %p %d %b")


@chat.route("/admin/chat", methods=["POST"])
@cross_origin(origin="*")
@auth_required(chat=True)
def join(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]
    user = AbstractUser.query.filter_by(user_id=user_id).first()
    user_name = user.first_name

    if user_status == UserStatus.online_tenant.value:
        room = TenantRoom.query.filter_by(tenant_id=user_id).first()

    elif user_status == UserStatus.online_owner.value:
        room = OwnerRoom.query.filter_by(owner_id=user_id).first()

    elif user_status == UserStatus.online_manager.value:
        data = request.get_json()
        try:
            client_id = int(data.get("client_id"))
            role = data.get("role")
        except:
            return Response(
                json.dumps(
                    {"success": False, "error": "Invalid Client ID and/or Role.", }),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        if role == ROLE["tenant"]:
            room = TenantRoom.query.filter_by(
                tenant_id=client_id, manager_id=user_id).first()
        elif role == ROLE["owner"]:
            room = OwnerRoom.query.filter_by(
                owner_id=client_id, manager_id=user_id).first()
        else:
            return Response(
                json.dumps(
                    {"success": False, "error": "Invalid Role.", }),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        if not room:
            return Response(
                json.dumps(
                    {"success": False, "error": "Room not found. Make sure you are connected with this user."}),
                status=RESPONSE_STATUS["NOT_FOUND"],
                mimetype="application/json",
            )

    room_id = room.room_id
    if room_id[0] == "t":
        messages = TenantMessage.query.filter(
            TenantMessage.room_id == room_id).order_by(TenantMessage.timestamp).all()
    elif room_id[0] == "o":
        messages = OwnerMessage.query.filter(
            OwnerMessage.room_id == room_id).order_by(OwnerMessage.timestamp).all()
    else:
        return Response(
            json.dumps(
                {"success": False, "error": "Invalid room id."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    history = [{
        "room_id": message.room_id,
        "author_id": message.author_id,
        "author_name": message.author_name,
        "message": message.text,
        "time": metatime(message.timestamp),
    } for message in messages]

    return Response(
        json.dumps(
            {"user_id": user_id, "room_id": room_id, "user_name": user_name, "history": history}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
