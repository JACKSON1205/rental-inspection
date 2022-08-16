from flask import Blueprint, Response, json, request
from flask_cors import cross_origin

from . import db
from .constants import RESPONSE_STATUS, ArtifactType
from .models import ManagerArtifact
from .utils import auth_required

archive = Blueprint("archive", __name__)


# Use this to get list of saved reports(received and due) and save a report
@archive.route("/admin/archive", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def archive_all(token_payload) -> Response:

    user_id = token_payload["user_id"]
    # GET archived artifacts
    if request.method == "GET":
        archive_list = None
        artifacts = ManagerArtifact.query.filter_by(manager_id=user_id).all()
        archive_list = [
            {
                "artifact_id": artifact.artifact_id,
                "artifact_json": artifact.artifact_json,
                "artifact_type": artifact.artifact_type.value,
                "artifact_date": artifact.artifact_date,
                "status": artifact.status.value,
            }
            for artifact in artifacts
        ]

        return Response(
            json.dumps({"archive_list": archive_list, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # POST archived artifact
    if request.method == "POST":
        """
        data = {"artifact_json":<json>,
                "title":<string>,
                "artifact_type":<string>,
                "artifact_date":<date>,
                }
        """
        data = request.get_json()
        artifact_json = data.get("artifact_json")
        title = data.get("title")
        artifact_type = data.get("artifact_type")

        # Add created artifact to archive
        artifact = ManagerArtifact()
        artifact.artifact_json = artifact_json
        if title:
            artifact.title = title
        artifact.artifact_type = artifact_type
        artifact.manager_id = user_id

        db.session.add(artifact)
        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["CREATED"],
            mimetype="application/json",
        )


# Use this to get a saved report, edit, and delete it
@archive.route("/admin/archive/<int:artifact_id>", methods=["GET", "PATCH", "DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def archive_update(artifact_id, token_payload) -> Response:

    artifact = ManagerArtifact.query.filter_by(artifact_id=artifact_id).first()
    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    # GET archived artifact
    if request.method == "GET":
        artifact_resp = {
            "artifact_json": artifact.artifact_json,
            "title": artifact.title,
            "artifact_type": artifact.artifact_type.value,
            "artifact_date": artifact.artifact_date,
            "status": artifact.status.value,
        }
        return Response(
            json.dumps({"artifact": artifact_resp, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # UPDATE archived artifact
    if request.method == "PATCH":
        """
        data = {"artifact_json":<json>,
                "title":<string>,
                ["artifact_type":<string>,]
                ["artifact_date":<date>,]
                ["status":<string>,]
                }
        """
        data = request.get_json()
        artifact_json = data.get("artifact_json")
        title = data.get("title")
        artifact_type = data.get("artifact_type")
        artifact_status = data.get("status")

        if artifact_json:
            artifact.artifact_json = artifact_json
        if title:
            artifact.title = title
        if artifact_type:
            artifact.artifact_type = artifact_type
        if artifact_status:
            artifact.status = artifact_status

        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # DELETE archived artifact
    if request.method == "DELETE":
        db.session.delete(artifact)
        db.session.commit()
        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )


######################################################################################

# GET list of archived due reports (the ones that a tenant should fill)
@archive.route("/admin/archive/reports/due", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def report_due(token_payload) -> Response:
    user_id = token_payload["user_id"]
    report_list = None
    reports = ManagerArtifact.query.filter_by(manager_id=user_id, artifact_type=ArtifactType.report_due.value).all()
    report_list = [
        {
            "artifact_id": report.artifact_id,
            "artifact_json": report.artifact_json,
            "artifact_type": report.artifact_type.value,
            "artifact_date": report.artifact_date,
            "status": report.status.value,
        }
        for report in reports
    ]
    return Response(
        json.dumps({"report_list": report_list, "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


# GET list of archived reports received (inspection reports to be sent to tenant/owner)
@archive.route("/admin/archive/reports/received", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def report_received(token_payload) -> Response:
    user_id = token_payload["user_id"]
    report_list = None
    reports = ManagerArtifact.query.filter_by(
        manager_id=user_id, artifact_type=ArtifactType.report_received.value
    ).all()
    report_list = [
        {
            "artifact_id": report.artifact_id,
            "artifact_json": report.artifact_json,
            "artifact_type": report.artifact_type.value,
            "artifact_date": report.artifact_date,
            "status": report.status.value,
        }
        for report in reports
    ]

    return Response(
        json.dumps({"report_list": report_list, "token": token_payload}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
