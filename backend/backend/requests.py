from flask import Blueprint, Response, json, request
from flask_cors import cross_origin
from operator import or_

import datetime as dt
from . import db
from .constants import (RESPONSE_STATUS, ArtifactStatus, ArtifactType,
                        UserStatus)
from .models import OwnerArtifact, Property, TenantArtifact
from .utils import auth_required, loadJSON

# Please note that this specific route is in plural
# to avoid any collision with flask request.
requests = Blueprint("requests", __name__)


"""
    Tenant/Owner GET requests
    USE THIS TO GET LIST OF ALL REQUESTS
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@requests.route("/admin/requests", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def requests_get(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if user_status == UserStatus.online_tenant.value:
        artifacts = (
            TenantArtifact.query.filter(TenantArtifact.tenant_id == user_id)
            .filter(
                or_(
                    TenantArtifact.artifact_type.value == ArtifactType.request_repair.value,
                    TenantArtifact.artifact_type.value == ArtifactType.request_lease_extension.value
                )
            )
            .order_by(TenantArtifact.artifact_date.desc())
        )

    elif user_status == UserStatus.online_owner.value:
        artifacts = (
            OwnerArtifact.query.filter(OwnerArtifact.owner_id == user_id)
            .filter(
                or_(
                    OwnerArtifact.artifact_type.value == ArtifactType.request_listing.value,
                    OwnerArtifact.artifact_type.value == ArtifactType.request_unlisting.value,
                    OwnerArtifact.artifact_type.value == ArtifactType.request_repair.value,
                    OwnerArtifact.artifact_type.value == ArtifactType.request_lease_extension.value
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
    Tenant/Owner POST requests
    USE THIS TO SEND REQUESTS FROM TENANT/OWNER TO MANAGER
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@requests.route("/admin/requests", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def requests_post(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    type_val_tenant = [
        ArtifactType.request_lease_extension.value,
        ArtifactType.request_repair.value,
    ]
    type_val_owner = [
        ArtifactType.request_listing.value,
        ArtifactType.request_unlisting.value,
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
    artifact_type = data.get("artifact_type")
    artifact_json = loadJSON(data.get("artifact_json"))

    # Create and insert artifact
    if user_status == UserStatus.online_tenant.value and artifact_type in type_val_tenant:

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

        artifact = TenantArtifact()
        artifact.tenant_id = user_id
        artifact_json["owner_id"] = prop.owner_id

        if artifact_type == ArtifactType.request_lease_extension.value:
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
            try:
                ext_date = dt.datetime.strptime(
                    artifact_json["extension_date"], "%Y-%m-%d")
                if ext_date.date() <= exp_date:
                    return Response(
                        json.dumps(
                            {
                                "success": False,
                                "error": "Invalid Date: Please pick a date later than your current lease expiration date.",
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
    # artifact.artifact_json = {key:val for key, val in json.loads(artifact_json)}
    artifact.artifact_json = artifact_json
    artifact.artifact_type = artifact_type
    artifact.tenant_id = user_id

    db.session.add(artifact)
    db.session.commit()

    return Response(
        json.dumps({"success": True}),
        status=RESPONSE_STATUS["CREATED"],
        mimetype="application/json",
    )


"""
    Tenant/Owner PATCH requests
    USE THIS TO REPSOND TO CONNECTION REQUEST FROM MANAGER
    OR OWNER RESPOND TO REPAIR/LEASE REQUESTS
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@requests.route("/admin/requests/<int:artifact_id>", methods=["PATCH"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def requests_update(artifact_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if user_status == UserStatus.online_tenant.value:
        artifact = TenantArtifact.query.filter_by(
            tenant_id=user_id, artifact_id=artifact_id).first()
    else:
        artifact = OwnerArtifact.query.filter_by(
            owner_id=user_id, artifact_id=artifact_id).first()
    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    """
        data = {"status":<string>}
    """
    data = request.get_json()
    status = data.get("status")

    # Approve/Deny Connection Request from Manager
    if artifact.artifact_type.value == ArtifactType.connection_from_manager.value:
        status_val_tenant = [
            ArtifactStatus.approved_by_tenant.value, ArtifactStatus.denied_by_tenant.value]
        status_val_owner = [
            ArtifactStatus.approved_by_owner.value, ArtifactStatus.denied_by_owner.value]
        status = data.get("status")
        if (user_status == UserStatus.online_tenant.value and status not in status_val_tenant) or (
            user_status == UserStatus.online_owner.value and status not in status_val_owner
        ):
            return Response(
                json.dumps(
                    {"success": False, "error": "Please provide a valid response."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        artifact.status = status
        db.session.commit()

        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # Owner Approve/Deny Repair/Lease Requests
    if user_status == UserStatus.online_owner.value and artifact.artifact_type.value in [ArtifactType.request_repair.value, ArtifactType.request_lease_extension.value]:
        status_val_owner = [
            ArtifactStatus.approved_by_owner.value, ArtifactStatus.denied_by_owner.value]
        status = data.get("status")
        if (status not in status_val_owner):
            return Response(
                json.dumps(
                    {"success": False, "error": "Please provide a valid response."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        artifact.status = status
        db.session.commit()

        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    else:
        return Response(
            json.dumps(
                {"success": False, "error": "You can't edit this item.", "token": token_payload}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
