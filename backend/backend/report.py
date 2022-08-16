from flask import Blueprint, Response, json, request, current_app
from flask_cors import cross_origin

from . import db
from .constants import (RESPONSE_STATUS, ArtifactStatus, ArtifactType,
                        UserStatus)
from .models import OwnerArtifact, TenantArtifact
from .utils import auth_required, loadJSON

report = Blueprint("report", __name__)


"""
    Tenant/Owner GET received reports
    USE THIS TO GET LIST OF ALL RECEIVED REPORTS
    (ACCESSED BY TENANT AND OWNER ONLY)
"""


@report.route("/admin/reports", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def reports_get(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if user_status == UserStatus.online_tenant.value:
        artifacts = TenantArtifact.query.filter_by(
            tenant_id=user_id, artifact_type=ArtifactType.report_received.value
        ).order_by(TenantArtifact.artifact_date.desc())
    elif user_status == UserStatus.online_owner.value:
        artifacts = OwnerArtifact.query.filter_by(
            owner_id=user_id, artifact_type=ArtifactType.report_received.value
        ).order_by(OwnerArtifact.artifact_date.desc())

    artifact_list = [
        {
            "artifact_id": artifact.artifact_id,
            "title": artifact.title,
            "artifact_date": artifact.artifact_date,
        }
        for artifact in artifacts
    ]

    return Response(
        json.dumps({"artifact_list": artifact_list, "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


"""
    Tenant GET reports due
    USE THIS TO GET LIST OF ALL DUE REPORTS
    (ACCESSED BY TENANT ONLY)
"""


@report.route("/admin/reports/due", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant"])
def reports_due_get(token_payload) -> Response:

    user_id = token_payload["user_id"]

    artifacts = TenantArtifact.query.filter_by(tenant_id=user_id, artifact_type=ArtifactType.report_due.value).order_by(
        TenantArtifact.artifact_date.desc()
    )

    artifact_list = [
        {
            "artifact_id": artifact.artifact_id,
            "title": artifact.title,
            "artifact_date": artifact.artifact_date,
        }
        for artifact in artifacts
    ]

    return Response(
        json.dumps({"artifact_list": artifact_list, "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


"""
    Tenant GET and UPDATE reports due
    USE THIS TO FULFILL DUE REPORTS
    (ACCESSED BY TENANT ONLY)
"""


@report.route("/admin/reports/due/<int:artifact_id>", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant"])
def reports_due_fulfill(artifact_id, token_payload) -> Response:

    user_id = token_payload["user_id"]
    artifact = TenantArtifact.query.filter_by(
        tenant_id=user_id, artifact_id=artifact_id, artifact_type=ArtifactType.report_due.value
    ).first()
    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    if request.method == "GET":
        artifact_resp = {
            "artifact_id": artifact.artifact_id,
            "artifact_json": artifact.artifact_json,
            "title": artifact.title,
            "artifact_date": artifact.artifact_date,
            "status": artifact.status.value,
        }
        return Response(
            json.dumps({"artifact_resp": artifact_resp,
                       "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "PATCH":
        """
        data = {*:<string>}
        """
        
        artifact.artifact_json = request.get_json()
        artifact.status = ArtifactStatus.fulfilled.value
        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

@report.route("/admin/reports/fulfilled/<int:artifact_id>", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def access_fulfilled_report(artifact_id, token_payload) -> Response:

    user_id = token_payload["user_id"]
    artifact = TenantArtifact.query.filter_by(
        manager_id=user_id, artifact_id=artifact_id, artifact_type=ArtifactType.report_due.value
    ).first()
    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    current_app.logger.debug(artifact.__dict__)

    artifact_resp = {
        "artifact_id": artifact.artifact_id,
        "artifact_json": artifact.artifact_json,
        "title": artifact.title,
        "artifact_date": artifact.artifact_date,
        "status": artifact.status.value,
    }
    return Response(
        json.dumps({"artifact_resp": artifact_resp,
                    "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
