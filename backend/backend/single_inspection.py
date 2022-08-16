from flask import Blueprint, current_app, json, request
from flask.wrappers import Response
from flask_cors import cross_origin

from . import db
from .constants import RESPONSE_STATUS, UserStatus
from .models import AbstractUser, Property

from .utils.utils import auth_required

single_inspection = Blueprint("single_inspection_api", __name__)

@single_inspection.route("/admin/inspections/schd_single/<int:property_id>", methods=["GET"])
@cross_origin(origin="*")
@auth_required
def access_properties(property_id, token_payload):
    """
    Access properties, this function will return a list of properties
    that user can access

    Input:
    - token_payload: if auth_headers contain valid token, then return
                  decoded user information, which includes user_id,
                  login role and token. Otherwise return Response
                  with error messages
    - filters: leased, manager_email, owner_email, tenant_email
                           if a contraint is empty string, then we
                           will ignore it

    Returns:
    - Respond
    """
    user_id = token_payload["user_id"]
    prop = (
        Property.query.filter_by(
            property_id=property_id,
            manager_id=token_payload['user_id'],
        ).first()
    )
    if not prop:
        return Response(
            json.dumps({
                "error": "Invalid property.",
                "success": False,
            }),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    if not prop.leased:
        return Response(
            json.dumps({
                "error": "This property is not leased",
                "success": False,
            }),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    property_details = {
        "property_id": prop.property_id,
        "address": prop.address,
        "post_code": str(prop.post_code),
        "leased": prop.leased,
        "tenant_name": "",
        "tenant_email": "",
        "owner_name": "",
        "owner_email": "",
    }

    if prop.tenant_id:
        tenant = AbstractUser.query.filter(AbstractUser.user_id == prop.tenant_id).first()
        property_details.update(
            {
                "tenant_name": tenant.last_name+' '+tenant.first_name,
                "tenant_email": tenant.email,
            }
        )
    if prop.owner_id:
        owner = AbstractUser.query.filter(AbstractUser.user_id == prop.owner_id).first()
        property_details.update(
            {
                "owner_name": owner.last_name+' '+owner.first_name,
                "owner_email": owner.email,
            }
        )

    current_app.logger.info("User_id {} access property list.".format(user_id))
    return Response(
        json.dumps({"property": property_details,}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )