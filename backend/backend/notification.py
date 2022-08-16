from flask import Blueprint, Response, json
from flask_cors import cross_origin

from . import db
import datetime as dt
from .constants import RESPONSE_STATUS, UserStatus
from .models import (ManagerNotification, OwnerArtifact, OwnerNotification,
                     TenantArtifact, TenantNotification)
from .utils import auth_required

notification = Blueprint("notification", __name__)


@notification.route("/admin/notifications", methods=["GET"])
@cross_origin(origin="*")
@auth_required
def notification_get(token_payload) -> Response:
    """
    Retrieve notification for role (not abstract user)

    """
    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    notifications = None
    notification_list = None

    def get_time(x):
        d = dt.datetime.strptime(str(x), "%Y-%m-%d %H:%M:%S.%f")
        return d.strftime("%a, %d %b %y, at %I:%M %p")

    if user_status == UserStatus.online_tenant.value:
        notifications = TenantNotification.query.filter_by(tenant_id=user_id).order_by(
            TenantNotification.timestamp.desc()
        )
    elif user_status == UserStatus.online_manager.value:
        notifications = ManagerNotification.query.filter_by(manager_id=user_id).order_by(
            ManagerNotification.timestamp.desc()
        )
    elif user_status == UserStatus.online_owner.value:
        notifications = OwnerNotification.query.filter_by(
            owner_id=user_id).order_by(OwnerNotification.timestamp.desc())

    if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
        get_artifact_type = (
            lambda x: None
            if not x
            else (TenantArtifact.query.filter_by(artifact_id=x).first().artifact_type).value
            if user_status == UserStatus.online_tenant.value
            else (OwnerArtifact.query.filter_by(artifact_id=x).first().artifact_type).value
        )

        notification_list = [
            {
                "notification_id": notification.notification_id,
                "text": notification.text,
                "timestamp": get_time(notification.timestamp),
                "read": notification.read,
                "artifact_id": notification.artifact_id,
                "artifact_type": get_artifact_type(notification.artifact_id),
            }
            for notification in notifications
        ]

    elif user_status == UserStatus.online_manager.value:
        def get_tenant_id(x): return None if not x else TenantArtifact.query.filter_by(
            artifact_id=x).first().tenant_id
        def get_owner_id(x): return None if not x else OwnerArtifact.query.filter_by(
            artifact_id=x).first().owner_id
        get_artifact_type = (
            lambda t, o: (TenantArtifact.query.filter_by(
                artifact_id=t).first().artifact_type).value
            if t
            else (OwnerArtifact.query.filter_by(artifact_id=o).first().artifact_type).value
            if o
            else None
        )
        notification_list = [
            {
                "notification_id": notification.notification_id,
                "text": notification.text,
                "artifact_type": get_artifact_type(notification.tenant_artifact_id, notification.owner_artifact_id),
                "timestamp": get_time(notification.timestamp),
                "source": notification.source.value,
                "read": notification.read,
                "tenant_id": get_tenant_id(notification.tenant_artifact_id),
                "owner_id": get_owner_id(notification.owner_artifact_id),
                "tenant_artifact_id": notification.tenant_artifact_id,
                "owner_artifact_id": notification.owner_artifact_id,
            }
            for notification in notifications
        ]

    return Response(
        json.dumps({"notifications": notification_list,
                   "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@notification.route("/admin/notifications/<int:notification_id>", methods=["PATCH"])
@cross_origin(origin="*")
@auth_required
def notification_read(notification_id, token_payload) -> Response:
    """
    mark notification as read
    """
    user_status = token_payload["status"]

    notification = None
    if user_status == UserStatus.online_tenant.value:
        notification = TenantNotification.query.filter_by(
            notification_id=notification_id).first()
    elif user_status == UserStatus.online_manager.value:
        notification = ManagerNotification.query.filter_by(
            notification_id=notification_id).first()
    elif user_status == UserStatus.online_owner.value:
        notification = OwnerNotification.query.filter_by(
            notification_id=notification_id).first()

    if not notification:
        return Response(
            json.dumps({"success": False, "error": "Notification not found"}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    notification.read = not notification.read
    db.session.commit()

    return Response(
        json.dumps({"success": True, "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
