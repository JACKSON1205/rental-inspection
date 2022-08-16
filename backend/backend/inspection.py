import datetime as dt
from operator import and_

from flask import Blueprint, Response, json, request, current_app
from flask_cors import cross_origin

from . import db
from .constants import (RESPONSE_STATUS, ArtifactStatus, ArtifactType,
                        UserStatus)
from .models import (Inspection, Itinerary, Owner, OwnerArtifact, Property,
                     TenantArtifact)
from .utils import auth_required, loadJSON

inspection = Blueprint("inspection", __name__)


"""
    USE THIS TO GET LIST OF INSPECTIONS
    FOR TENANT/OWNER -> RETURN ARTIFACT
    FOR MANAGER -> RETURN INSPECTION 
"""


@inspection.route("/admin/inspections", methods=["GET"])
@cross_origin(origin="*")
@auth_required
def inspections_get(token_payload) -> Response:
    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    # Tenant/Owner
    if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
        if user_status == UserStatus.online_tenant.value:
            artifacts = (
                TenantArtifact.query.filter(TenantArtifact.tenant_id == user_id)
                .filter(TenantArtifact.artifact_type == ArtifactType.inspection.value)
                .join(Inspection, TenantArtifact.inspection_id == Inspection.inspection_id)
                .join(Property, Inspection.property_id == Property.property_id)
                .add_columns(
                    TenantArtifact.artifact_id,
                    TenantArtifact.title,
                    TenantArtifact.artifact_date,
                    TenantArtifact.inspection_id,
                    Property.address,
                )
                .order_by(TenantArtifact.artifact_date.desc())
            )
        else:
            artifacts = (
                OwnerArtifact.query.filter(OwnerArtifact.owner_id == user_id)
                .filter(OwnerArtifact.artifact_type == ArtifactType.inspection.value)
                .join(Inspection, OwnerArtifact.inspection_id == Inspection.inspection_id)
                .join(Property, Inspection.property_id == Property.property_id)
                .add_columns(
                    OwnerArtifact.artifact_id,
                    OwnerArtifact.title,
                    OwnerArtifact.artifact_date,
                    OwnerArtifact.inspection_id,
                    Property.address,
                )
                .order_by(OwnerArtifact.artifact_date.desc())
            )

        inspection_list = [
            {
                "artifact_id": artifact.artifact_id,
                "artifact_title": artifact.title,
                "artifact_date": artifact.artifact_date,
                "inspection_id": artifact.inspection_id,
                "address": artifact.address,
            }
            for artifact in artifacts
        ]
        return Response(
            json.dumps({"inspection_list": inspection_list, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # Manager
    else:
        inspections = (
            Inspection.query.filter(Inspection.manager_id == user_id)
            .join(Property, Inspection.property_id == Property.property_id)
            .add_columns(
                Inspection.inspection_id,
                Inspection.inspection_date,
                Inspection.from_time,
                Inspection.to_time,
                Inspection.status,
                Inspection.property_id,
                Inspection.manager_id,
                Inspection.itinerary_id,
                Property.address,
            )
            .order_by(Inspection.inspection_date.desc(), Inspection.from_time)
        )
        inspection_list = [
            {
                "inspection_date": str(inspection.inspection_date),
                "from_time": str(inspection.from_time),
                "to_time": str(inspection.to_time),
                "status": inspection.status.value,
                "property_id": inspection.property_id,
                "manager_id": inspection.manager_id,
                "itinerary_id": inspection.itinerary_id,
                "address": inspection.address,
                "inspection_id": inspection.inspection_id,
            }
            for inspection in inspections
        ]
        return Response(
            json.dumps({"inspections": inspection_list, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )


"""
    USE THIS TO CREATE INSPECTIONS (ACCESSED BY MANAGER ONLY)
"""


@inspection.route("/admin/inspections", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def inspections_post(token_payload) -> Response:
    user_id = token_payload["user_id"]
    """
        data = {"inspection_date":<date>,
                "from_time":<datetime>,
                "to_time":<datetime>,
                "property_id":<integer>
                "itinerary_id":<integer>
                }
    """
    data = request.get_json()
    try:
        inspection_date = dt.datetime.strptime(data.get("inspection_date"), "%Y-%m-%d")
        from_time = dt.datetime.strptime(data.get("from_time"), "%H:%M")
        to_time = dt.datetime.strptime(data.get("to_time"), "%H:%M")
    except Exception as e:
        current_app.logger.error("::ERROR:: Cannot parse selected date or time")
        return Response(
            json.dumps({"error": "::ERROR:: Cannot parse selected date or time"}),
            status=RESPONSE_STATUS["INTERNAL"],
            mimetype="application/json",
        )
    property_id = int(data.get("property_id"))
    property = Property.query.filter_by(property_id=property_id).first()
    itinerary_id = None
    itinerary = None
    try:
        itinerary_id = int(data.get("itinerary_id"))
        itinerary = Itinerary.query.filter_by(itinerary_id=itinerary_id).first()
    except:
        pass

    error = []

    if inspection_date < dt.datetime.today():
        error.append("Invalid inspection date.")
    if inspection_date == dt.datetime.today() and from_time < dt.datetime.now():
        error.append("Invalid start time.")
    if to_time <= from_time:
        error.append("Invalid finish time.")
    if not property:
        error.append("Property does not exist.")
    if property and (property.manager_id != user_id):
        error.append("You do not manage this property.")
    if itinerary_id and not itinerary:
        error.append("Itinerary does not exist.")
    if itinerary_id and itinerary and (itinerary.itinerary_date < inspection_date):
        error.append("You cannot add inspections to past intieraries")

    min_inspection_gap = Inspection.query.filter(
                                Inspection.property_id == property_id
                            ).filter(
                            and_(
                                (Inspection.inspection_date<inspection_date+dt.timedelta(days=90)), 
                                (Inspection.inspection_date>inspection_date-dt.timedelta(days=90))
                            )
                        ).first()
    current_app.logger.info(inspection_date)
    if min_inspection_gap:
        error.append("Inspections cannot be scheduled less than 90 days apart. "
                    f"Property {property.address} already has an inspection scheduled for {min_inspection_gap.inspection_date}. "
                    "Either change the inspection date or remove the property from the list.")
        
    
    if error:
        return Response(
            json.dumps({"success": False, "error": error}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    new_inspection = Inspection()
    new_inspection.inspection_date = inspection_date
    new_inspection.from_time = from_time
    new_inspection.to_time = to_time
    new_inspection.manager_id = user_id
    new_inspection.property_id = property_id
    if itinerary_id:
        new_inspection.itinerary_id = itinerary_id
    db.session.add(new_inspection)
    db.session.commit()

    return Response(
        json.dumps({"success": True, "token": token_payload}),
        status=RESPONSE_STATUS["CREATED"],
        mimetype="application/json",
    )


"""
    USE THIS TO UPDATE INSPECTIONS
    FOR TENANT/OWNER PASS artifact_id -> GET artifact -> UPDATE artifact_json FIELD (RESCHEDULE)
    FOR MANAGER PASS inspection_id -> GET inspection -> UPDATE [inspection_date, from_time, to_time, status]
"""


@inspection.route("/admin/inspections/<int:inspection_id>", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required
def inspections_update(inspection_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    # Tenant/Owner
    if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
        if user_status == UserStatus.online_tenant.value:
            inspection = (
                TenantArtifact.query.filter(TenantArtifact.tenant_id == user_id)
                .filter(TenantArtifact.artifact_type == ArtifactType.inspection.value)
                .filter(TenantArtifact.artifact_id == inspection_id)
                .first()
            )
        else:
            inspection = (
                OwnerArtifact.query.filter(OwnerArtifact.owner_id == user_id)
                .filter(OwnerArtifact.artifact_type == ArtifactType.inspection.value)
                .filter(OwnerArtifact.artifact_id == inspection_id)
                .first()
            )
    else:
        inspection = (
            Inspection.query.filter(Inspection.manager_id == user_id)
            .filter(Inspection.inspection_id == inspection_id)
            .first()
        )

    if not inspection:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    if request.method == "GET":
        if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
            get_address = (
                lambda x: Inspection.query.filter(Inspection.inspection_id == x)
                .join(Property, Property.property_id == Inspection.property_id)
                .add_columns(Property.address)
                .first()
                .address
            )
            inspection = {
                "artifact_id": inspection.artifact_id,
                "inspection_id": inspection.inspection_id,
                "artifact_json": inspection.artifact_json,
                "title": inspection.title,
                "artifact_date": inspection.artifact_date,
                "status": inspection.status.value,
                "address": get_address(inspection_id),
            }
        else:
            get_address_manager = lambda x: Property.query.filter(Property.property_id == x).first().address
            inspection = {
                "inspection_date": str(inspection.inspection_date),
                "from_time": str(inspection.from_time),
                "to_time": str(inspection.to_time),
                "status": inspection.status.value,
                "manager_id": inspection.manager_id,
                "property_id": inspection.property_id,
                "itinerary_id": inspection.itinerary_id,
                "address": get_address_manager(inspection.property_id),
            }

        return Response(
            json.dumps({"inspection": inspection, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "PATCH":

        data = request.get_json()

        if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
            # Reschedule Inspection
            """
            MAY VARY
            data = {
                    "request_date":<string>,
                    "request_time":<string>
                    }
            """
            request_date = dt.datetime.strptime(data.get("request_date"), "%Y-%m-%d").date()
            request_time = dt.datetime.strptime(data.get("request_time"), "%H:%M").time()
            today = dt.datetime.today().date()
            now = dt.datetime.now().time()
            if (
                not (request_date and request_time)
                or (request_date < today)
                or (request_date == today and request_time < now)
            ):
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "Please provide a valid date and time to reschedule.",
                            "token": token_payload,
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            artifact_json = loadJSON(inspection.artifact_json)
            artifact_json["request_date"] = str(request_date)
            artifact_json["request_time"] = str(request_time)
            inspection.artifact_json = artifact_json
            inspection.status = ArtifactStatus.reschedule.value
            db.session.commit()
            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["OK"],
                mimetype="application/json",
            )

        # Manager
        elif user_status == UserStatus.online_manager.value:
            """
            data = {"inspection_date":<date>,
                    "from_time":<datetime>,
                    "to_time":<datetime>,
                    "status":<string>,
                    "itinerary_id":<integer>
                    }
            """

            inspection_date = dt.datetime.strptime(data.get("inspection_date"), "%Y-%m-%d").date()
            from_time = dt.datetime.strptime(data.get("from_time"), "%H:%M").time()
            to_time = dt.datetime.strptime(data.get("to_time"), "%H:%M").time()
            status = data.get("status")
            itinerary_id = None
            itinerary = None
            try:
                itinerary_id = int(data.get("itinerary_id"))
                itinerary = Itinerary.query.filter_by(itinerary_id=itinerary_id).first()
            except:
                pass

            error = []

            today = dt.datetime.today().date()
            now = dt.datetime.now().time()
            if inspection_date < today:
                error.append("Invalid inspection date.")
            if inspection_date == today and from_time < now:
                error.append("Invalid start time.")
            if to_time <= from_time:
                error.append("Invalid finish time.")
            if itinerary_id and not itinerary:
                error.append("Itinerary does not exist.")
            if itinerary_id and itinerary and (itinerary.itinerary_date < inspection_date):
                error.append("You cannot add inspections to past intieraries")

            if error:
                return Response(
                    json.dumps({"success": False, "error": error}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            inspection.inspection_date = inspection_date
            inspection.from_time = from_time
            inspection.to_time = to_time
            inspection.status = status
            inspection.manager_id = user_id
            if itinerary_id:
                inspection.itinerary_id = itinerary_id
            db.session.commit()

            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["OK"],
                mimetype="application/json",
            )


"""
    USE THIS TO DELETE AN INSPECTION (ACCESSED BY MANAGER ONLY)
"""


@inspection.route("/admin/inspections/<int:inspection_id>", methods=["DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def inspections_delete(inspection_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    inspection = Inspection.query.filter_by(manager_id=user_id, inspection_id=inspection_id).first()

    if not inspection:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    if request.method == "DELETE":
        inspection.status = "canceled"
        db.session.commit()
        db.session.delete(inspection)
        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
