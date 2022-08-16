from flask import Blueprint, Response, json, request
from flask_cors import cross_origin
from operator import or_
import datetime as dt
from . import db
from .constants import RESPONSE_STATUS, ArtifactType, UserStatus
from .models import Contact, Notice, OwnerArtifact, TenantArtifact, Property
from .utils import auth_required, loadJSON, next_hour

notice = Blueprint("notice", __name__)

"""
    Tenant/Owner GET notices
    USE THIS TO GET LIST OF ALL NOTICES
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@notice.route("/admin/notices", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def notices_get(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if user_status == UserStatus.online_tenant.value:
        artifacts = (
            TenantArtifact.query.filter(TenantArtifact.tenant_id == user_id)
            .filter(
                or_(
                    TenantArtifact.artifact_type.value == ArtifactType.notice_eviction.value,
                    TenantArtifact.artifact_type.value == ArtifactType.notice_leave.value
                )
            )
            .order_by(TenantArtifact.artifact_date.desc())
        )

    elif user_status == UserStatus.online_owner.value:
        artifacts = (
            OwnerArtifact.query.filter(OwnerArtifact.owner_id == user_id)
            .filter(
                or_(
                    OwnerArtifact.artifact_type.value == ArtifactType.notice_leave.value,
                    OwnerArtifact.artifact_type.value == ArtifactType.notice_eviction.value
                )
            )
            .order_by(OwnerArtifact.artifact_date.desc())
        )

    artifact_list = [
        {
            "artifact_id": artifact.artifact_id,
            "artifact_title": artifact.title,
            "artifact_date": artifact.artifact_date,
        }
        for artifact in artifacts
    ]

    return Response(
        json.dumps({"artifact_list": artifact_list}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


"""
    Tenant/Owner POST notices
    USE THIS TO SEND NOTICES FROM TENANT/OWNER TO MANAGER
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@notice.route("/admin/notices", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def notices_post(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    type_val_tenant = [
        ArtifactType.notice_leave.value,
    ]
    type_val_owner = [
        ArtifactType.notice_eviction.value,
    ]

    """
        data = {
                ["title":<string>,]
                "artifact_json":<json>,
                "artifact_type":<string>,
                }
    """

    data = request.get_json()
    # title = data.get("title")
    artifact_json = loadJSON(data.get("artifact_json"))
    artifact_type = data.get("artifact_type")

    # Create and insert artifact
    if user_status == UserStatus.online_tenant.value and artifact_type in type_val_tenant:
        artifact = TenantArtifact()
        artifact.tenant_id = user_id
        if artifact_type == ArtifactType.notice_leave.value:
            prop = Property.query.filter_by(tenant_id=user_id).first()
            if not prop:
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "You don't occupy any property.",
                        }
                    ),
                    status=RESPONSE_STATUS["NOT_FOUND"],
                    mimetype="application/json",
                )
            if not prop.lease_expiration_date:
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "lease expiration date field is empty but a tenant is assigned to the property.",
                        }
                    ),
                    status=RESPONSE_STATUS["INTERNAL"],
                    mimetype="application/json",
                )
            exp_date = prop.lease_expiration_date
            try:
                leave_date = dt.datetime.strptime(
                    artifact_json["leave_date"], "%Y-%m-%d")
                if leave_date.date() >= exp_date:
                    return Response(
                        json.dumps(
                            {
                                "success": False,
                                "error": "Invalid Date: Please pick a date earlier than your current lease expiration date.",
                            }
                        ),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
                if leave_date <= dt.datetime.today() + dt.timedelta(days=14):
                    return Response(
                        json.dumps(
                            {
                                "success": False,
                                "error": "Invalid Date: leave notice must be at least 2 weeks.",
                            }
                        ),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
            except:
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "Invalid Date: Missing or incorrect date format.",
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
    elif user_status == UserStatus.online_owner.value and artifact_type in type_val_owner:
        artifact = OwnerArtifact()
        artifact.owner_id = user_id
        if artifact_type == ArtifactType.notice_eviction.value:
            try:
                property_id = int(artifact_json["property_id"])
                prop = Property.query.filter_by(
                    owner_id=user_id, property_id=property_id).first()
                if not prop:
                    return Response(
                        json.dumps(
                            {
                                "success": False,
                                "error": "Property not found.",
                            }
                        ),
                        status=RESPONSE_STATUS["NOT_FOUND"],
                        mimetype="application/json",
                    )
                if prop.leased:
                    if not prop.lease_expiration_date:
                        return Response(
                            json.dumps(
                                {
                                    "success": False,
                                    "error": "lease expiration date field is empty but the property is leased to a tenant.",
                                }
                            ),
                            status=RESPONSE_STATUS["INTERNAL"],
                            mimetype="application/json",
                        )
                    exp_date = prop.lease_expiration_date
                    eviction_date = dt.datetime.strptime(
                        artifact_json["eviction_date"], "%Y-%m-%d")
                    if eviction_date.date() >= exp_date:
                        return Response(
                            json.dumps(
                                {
                                    "success": False,
                                    "error": "Invalid Date: Please pick a date earlier than the current lease expiration date.",
                                }
                            ),
                            status=RESPONSE_STATUS["BAD_REQUEST"],
                            mimetype="application/json",
                        )
                    if eviction_date <= dt.datetime.today() + dt.timedelta(days=14):
                        return Response(
                            json.dumps(
                                {
                                    "success": False,
                                    "error": "Invalid Date: eviction notice must be at least 2 weeks.",
                                }
                            ),
                            status=RESPONSE_STATUS["BAD_REQUEST"],
                            mimetype="application/json",
                        )
                else:
                    return Response(
                        json.dumps(
                            {
                                "success": False,
                                "error": "Property is not leased.",
                            }
                        ),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
            except:
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "Invalid Date: Missing or incorrect date format.",
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
    else:
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "You can't create an item of type {}".format(artifact_type),
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    # artifact.title = title
    artifact.artifact_json = artifact_json
    artifact.artifact_type = artifact_type
    db.session.add(artifact)
    db.session.commit()

    return Response(
        json.dumps({"success": True}),
        status=RESPONSE_STATUS["CREATED"],
        mimetype="application/json",
    )


"""
    USE THIS TO SCHEDULE NOTICE
    AND GET LIST OF SCHEDULED NOTICES
    (ACCESSED BY MANAGER ONLY)
"""


@notice.route("/admin/schedule", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def notices_schedule(token_payload) -> Response:

    user_id = token_payload["user_id"]

    if request.method == "GET":
        notices = Notice.query.filter_by(manager_id=user_id).all()
        notices_list = [
            {
                "notice_id": n.notice_id,
                "message": n.message,
                "recipient_email": n.recipient_email,
                "tenant": n.tenant,
                "owner": n.owner,
                "notice_date": str(n.notice_date),
                "notice_time": str(n.notice_time),
                "sent": n.sent,
                "contact_id": n.contact_id,
            }
            for n in notices
        ]

        return Response(
            json.dumps({"data": notices_list}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "POST":
        """
        AT LEAST ONE OF [recipient_email, contact_id] MUST BE PASSED.
        data = {
                "message":<string>,
                ["recipient_email":<string>],
                "tenant":<bool>,
                "owner":<bool>,
                "notice_date":<date>,
                "notice_time":<time>,
                ["contact_id":<integer>],
                }
        """
        data = request.get_json()
        message = data.get("message")
        recipient_email = data.get("recipient_email")
        tenant = data.get("tenant")
        owner = data.get("owner")
        notice_date = data.get("notice_date")
        notice_time = data.get("notice_time")

        today = dt.datetime.today().date()
        now = dt.datetime.now().time()

        if notice_date:
            notice_date = dt.datetime.strptime(notice_date, "%Y-%m-%d").date()
        if notice_time:
            notice_time = dt.datetime.strptime(notice_time, "%H:%M:%S").time()
        contact_id = data.get("contact_id")
        if (notice_date == today) and (not notice_time):
            notice_time = next_hour(dt.datetime.now()).time()
        if not notice_time:
            notice_time = dt.time(6, 0, 0)

        # do not move this part to the below error checks
        if contact_id:
            contact = Contact.query.filter_by(
                contact_id=contact_id, manager_id=user_id).first()
            if not contact:
                return Response(
                    json.dumps(
                        {"success": False, "error": "Invalid Contact ID"}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            else:
                recipient_email = contact.email
        elif recipient_email and not contact_id:
            contact = Contact.query.filter_by(
                email=recipient_email, manager_id=user_id).first()
            if not contact:
                return Response(
                    json.dumps({"success": False, "error": "Invalid Email."}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            else:
                contact_id = contact.contact_id

        error = []
        if not message:
            error.append("You must write something in the notice message.")
        if not any([tenant, owner]):
            error.append("You must pick a role for the recipient.")
        if tenant and owner:
            error.append("You can only pick one role for the recipient.")
        if (tenant and not contact.tenant) or (owner and not contact.owner):
            error.append("This contact does not have this role.")
        if not notice_date:
            error.append("You must pick a date.")
        if not any([recipient_email, contact_id]):
            error.append(
                "You must enter an email, or schedule notices from contacts page.")
        if notice_date < today:
            error.append("Invalid Date.")
        if notice_date == today and notice_time < now:
            error.append("Invalid Time.")

        if error:
            return Response(
                json.dumps({"success": False, "error": error}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        n = Notice()
        n.message = message
        n.recipient_email = recipient_email
        n.tenant = tenant if tenant else False
        n.owner = owner if owner else False
        n.notice_date = notice_date
        n.notice_time = notice_time
        n.contact_id = contact_id
        n.manager_id = user_id

        db.session.add(n)
        db.session.commit()

        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["CREATED"],
            mimetype="application/json",
        )


"""
    USE THIS TO GET/UPDATE/DELETE A NOTICE
    (ACCESSED BY MANAGER ONLY)
"""


@notice.route("/admin/schedule/<int:notice_id>", methods=["GET", "PATCH", "DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def notices_update(notice_id, token_payload) -> Response:

    user_id = token_payload["user_id"]
    n = Notice.query.filter_by(manager_id=user_id, notice_id=notice_id).first()
    if not n:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    if request.method == "GET":
        n = {
            "notice_id": n.notice_id,
            "message": n.message,
            "recipient_email": n.recipient_email,
            "tenant": n.tenant,
            "owner": n.owner,
            "notice_date": str(n.notice_date),
            "notice_time": str(n.notice_time),
            "sent": n.sent,
            "contact_id": n.contact_id,
        }
        return Response(
            json.dumps({"data": n}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "PATCH":
        """
        data = {
                "message":<string>,
                "notice_date":<date>,
                "notice_time":<time>,
                }
        """
        if n.sent:
            return Response(
                json.dumps(
                    {"success": False, "error": "This notice has already been sent."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        data = request.get_json()
        message = data.get("message")
        notice_date = data.get("notice_date")
        notice_time = data.get("notice_time")

        today = dt.datetime.today().date()
        now = dt.datetime.now().time()

        if notice_date:
            notice_date = dt.datetime.strptime(notice_date, "%Y-%m-%d").date()
        if notice_time:
            notice_time = dt.datetime.strptime(notice_time, "%H:%M:%S").time()
        if (notice_date == today) and (not notice_time):
            notice_time = next_hour(dt.datetime.now()).time()
        if not notice_time:
            notice_time = dt.time(6, 0, 0)

        error = []
        if not message:
            error.append("You must write something in the notice message.")
        if not notice_date:
            error.append("You must pick a date.")
        if notice_date < today:
            error.append("Invalid Date.")
        if notice_date == today and notice_time < now:
            error.append("Invalid Time.")

        if error:
            return Response(
                json.dumps({"success": False, "error": error}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        n.message = message
        n.notice_date = notice_date
        n.notice_time = notice_time
        db.session.commit()
        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "DELETE":
        if n.sent:
            return Response(
                json.dumps(
                    {"success": False, "error": "This notice has already been sent."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )
        db.session.delete(n)
        db.session.commit()
        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
