from flask import Blueprint, Response, json, request, current_app
from flask_cors import cross_origin
from sqlalchemy.orm import aliased
import re
from . import db
from .constants import (RESPONSE_STATUS, ArtifactStatus, ArtifactType,
                        UserStatus)
from .models import AbstractUser, CustomTemplate, Owner, OwnerArtifact, Tenant, TenantArtifact
from .utils import auth_required, loadJSON

import datetime as dt

artifact = Blueprint("artifact", __name__)


"""
    USE THIS TO GET SINGLE ARTIFACT FOR TENANT/OWNER
    (ACCESS BY TENANT AND OWNER ONLY)
"""


@artifact.route("/admin/artifacts/<int:artifact_id>", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["tenant", "owner"])
def artifact_get(artifact_id, token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if user_status == UserStatus.online_tenant.value:
        artifact = TenantArtifact.query.filter_by(
            artifact_id=artifact_id, tenant_id=user_id).first()
    elif user_status == UserStatus.online_owner.value:
        artifact = OwnerArtifact.query.filter_by(
            artifact_id=artifact_id, owner_id=user_id).first()

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
            "artifact_type": artifact.artifact_type.value,
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


"""
    USE THIS TO GET AND SEND STUFF FROM MANAGER TO TENANT (USING ID)
    (ACCESS BY MANAGER ONLY)
"""


@artifact.route("/admin/tenant/<int:tenant_id>/artifacts", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def tenant_artifact_get_post(tenant_id, token_payload) -> Response:

    user_id = token_payload["user_id"]

    if request.method == "GET":
        artifact_list = None
        artifacts = TenantArtifact.query.filter_by(
            tenant_id=tenant_id, manager_id=user_id).all()
        artifact_list = [
            {
                "artifact_id": artifact.artifact_id,
                "title": artifact.title,
                "artifact_json": artifact.artifact_json,
                "artifact_type": artifact.artifact_type.value,
                "artifact_date": artifact.artifact_date,
                "status": artifact.status.value,
            }
            for artifact in artifacts
        ]

        return Response(
            json.dumps({"artifact_list": artifact_list,
                       "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "POST":
        type_val_manager = [
            ArtifactType.report_received.value,
            ArtifactType.report_due.value,
            ArtifactType.inspection.value,
            ArtifactType.notice_eviction.value,
            ArtifactType.connection_from_manager.value,
        ]
        """
            data = {
                    "title":<string>,
                    "artifact_json":<json>,
                    "artifact_type":<string>,
                    }
        """
        data = request.get_json()
        title = data.get("title")
        artifact_json = loadJSON(data.get("artifact_json"))
        artifact_type = data.get("artifact_type")

        if artifact_type in type_val_manager:
            # Create and insert artifact
            artifact = TenantArtifact()
            if title:
                artifact.title = title
            artifact.artifact_json = artifact_json
            artifact.artifact_type = artifact_type
            artifact.tenant_id = tenant_id
            artifact.manager_id = user_id

            db.session.add(artifact)
            db.session.commit()

            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["CREATED"],
                mimetype="application/json",
            )

        else:
            return Response(
                json.dumps(
                    {
                        "success": False,
                        "error": "You can't create an item of type {} for a tenant".format(artifact_type),
                        "token": token_payload,
                    }
                ),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )


#######################################################################################

"""
    USE THIS TO GET AND SEND STUFF FROM MANAGER TO TENANT (USING EMAIL)
    (ACCESS BY MANAGER ONLY)
"""


@artifact.route("/admin/tenant/artifacts", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def tenant_artifact_post(token_payload) -> Response:

    current_app.logger.debug(f"Stage 1")

    user_id = token_payload["user_id"]

    type_val_manager = [
        ArtifactType.report_received.value,
        ArtifactType.report_due.value,
        ArtifactType.inspection.value,
        ArtifactType.notice_eviction.value,
        ArtifactType.connection_from_manager.value,
    ]

    current_app.logger.debug(f"Stage 2")
    """
        data = {
                "title":<string>,
                "artifact_json":<json>,
                "artifact_type":<string>,
                "email":<string>,
                }
    """
    data = request.get_json()
    title = data.get("title")
    artifact_json = json.loads(data.get("artifact_json"))
    artifact_type = data.get("artifact_type")
    email = data.get("email")

    current_app.logger.debug(f"Stage 3")

    if (not email) or (re.match(r"[a-zA-Z0-9_\-]+@[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+", email) is None):
        current_app.logger.debug(f"Stage 4")
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "Invalid email address.",
                    "email": email,
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    tenant = AbstractUser.query.filter(AbstractUser.email == email)\
        .join(Tenant, AbstractUser.user_id == Tenant.tenant_id)\
        .add_columns(Tenant.manager_id.label("manager_id"))\
        .first()

    if not tenant:
        current_app.logger.debug(f"Stage 7")
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "No tenant user is linked to that email.",
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    tenant_id = tenant.AbstractUser.user_id
    manager_id = tenant.manager_id

    if manager_id != user_id:
        current_app.logger.debug(f"Stage 8")
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "You are not a manager for this user. Connect with your clients from Contacts page.",
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    if artifact_type in type_val_manager:
        current_app.logger.debug(f"Stage 10")
        # Create and insert artifact
        artifact = TenantArtifact()
        if title:
            artifact.title = title
        current_app.logger.debug(f"Stage 11")
        artifact.artifact_json = artifact_json
        artifact.artifact_type = artifact_type
        artifact.tenant_id = tenant_id
        artifact.manager_id = user_id

        current_app.logger.debug(f"Stage 12")
        db.session.add(artifact)
        db.session.commit()

        current_app.logger.debug(f"Stage 13")

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["CREATED"],
            mimetype="application/json",
        )

    else:
        current_app.logger.debug(f"Stage 14")
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "You can't create an item of type {} for a tenant".format(artifact_type),
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )


#######################################################################################


"""
    USE THIS TO GET AND UPDATE STUFF FROM MANAGER TO TENANT
    RESPOND TO: connection_from_tenant, request_repair, request_lease_extension
    (ACCESSED BY MANAGER ONLY)
"""


@artifact.route("/admin/tenant/<int:tenant_id>/artifacts/<int:artifact_id>", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def tenant_artifact_update(tenant_id, artifact_id, token_payload) -> Response:

    user_id = token_payload["user_id"]

    artifact = TenantArtifact.query.filter_by(
        tenant_id=tenant_id, artifact_id=artifact_id, manager_id=user_id).first()

    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

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

    if request.method == "PATCH":
        """
        MAY VARY
        data = {}
        """
        data = request.get_json()
        artifact_type = artifact.artifact_type.value
        repair = ArtifactType.request_repair.value
        extension = ArtifactType.request_lease_extension.value
        approved_by_owner = ArtifactStatus.approved_by_owner.value

        # Repair Request, Lease Extension Request, Connection Request
        if artifact_type in [
            repair,
            extension,
            ArtifactType.connection_from_tenant.value,
        ]:
            status = data.get("status")
            approved = status == ArtifactStatus.approved_by_manager.value
            denied = status == ArtifactStatus.denied_by_manager.value
            if not any([approved, denied]):
                return Response(
                    json.dumps(
                        {"success": False, "error": "Please provide a valid response.", "token": token_payload}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            # if artifact_type in [repair, extension] and (artifact.status != approved_by_owner):
            #     return Response(
            #         json.dumps(
            #             {"success": False, "error": "Owner's approval is required."}),
            #         status=RESPONSE_STATUS["BAD_REQUEST"],
            #         mimetype="application/json",
            #     )

            artifact.status = status
            db.session.commit()
            return Response(
                json.dumps(
                    {"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["OK"],
                mimetype="application/json",
            )

        else:
            return Response(
                json.dumps(
                    {"success": False, "error": "You can't edit this item."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )


#######################################################################################


"""
    USE THIS TO GET AND SEND STUFF FROM MANAGER TO OWNER (USING ID)
    (ACCESSED BY MANAGER ONLY)
"""


@artifact.route("/admin/owner/<int:owner_id>/artifacts", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def owner_artifact_get_post(owner_id, token_payload) -> Response:

    user_id = token_payload["user_id"]

    if request.method == "GET":
        artifact_list = None
        artifacts = OwnerArtifact.query.filter_by(
            owner_id=owner_id, manager_id=user_id).all()
        artifact_list = [
            {
                "artifact_id": artifact.artifact_id,
                "title": artifact.title,
                "artifact_json": artifact.artifact_json,
                "artifact_type": artifact.artifact_type.value,
                "artifact_date": artifact.artifact_date,
                "status": artifact.status.value,
            }
            for artifact in artifacts
        ]

        return Response(
            json.dumps({"artifact_list": artifact_list,
                       "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "POST":
        type_val_manager = [
            ArtifactType.report_received.value,
            ArtifactType.inspection.value,
            ArtifactType.notice_leave.value,
            ArtifactType.connection_from_manager.value,
            ArtifactType.request_repair.value,
            ArtifactType.request_lease_extension.value,
        ]
        """
            data = {
                    "title":<string>,
                    "artifact_json":<json>,
                    "artifact_type":<string>,
                    }
        """
        data = request.get_json()
        title = data.get("title")
        artifact_json = loadJSON(data.get("artifact_json"))
        artifact_type = data.get("artifact_type")

        if artifact_type in type_val_manager:
            # Create and insert artifact
            artifact = OwnerArtifact()
            artifact.title = title
            artifact.artifact_json = artifact_json
            artifact.artifact_type = artifact_type
            artifact.owner_id = owner_id
            artifact.manager_id = user_id

            db.session.add(artifact)
            db.session.commit()

            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["CREATED"],
                mimetype="application/json",
            )

        else:
            return Response(
                json.dumps(
                    {
                        "success": False,
                        "error": "You can't create an item of type {} for a property owner.".format(artifact_type),
                        "token": token_payload,
                    }
                ),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )


#######################################################################################


"""
    USE THIS TO GET AND SEND STUFF FROM MANAGER TO OWNER (USING EMAIL)
    (ACCESS BY MANAGER ONLY)
"""


@artifact.route("/admin/owner/artifacts", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def owner_artifact_post(token_payload) -> Response:

    user_id = token_payload["user_id"]

    type_val_manager = [
        ArtifactType.report_received.value,
        ArtifactType.inspection.value,
        ArtifactType.notice_leave.value,
        ArtifactType.connection_from_manager.value,
        ArtifactType.request_repair.value,
        ArtifactType.request_lease_extension.value,
    ]
    """
        data = {
                "title":<string>,
                "artifact_json":<json>,
                "artifact_type":<string>,
                "email":<string>,
                }
    """
    data = request.get_json()
    title = data.get("title")
    artifact_json = loadJSON(data.get("artifact_json"))
    artifact_type = data.get("artifact_type")
    email = data.get("email")

    if (not email) or (re.match(r"[a-zA-Z0-9_\-]+@[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+", email) is None):
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "Invalid email address.",
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    owner = AbstractUser.query.filter(AbstractUser.email == email)\
        .join(Owner, AbstractUser.user_id == Owner.owner_id)\
        .add_columns(Owner.manager_id.label("manager_id"))\
        .first()

    owner_id = owner.AbstractUser.user_id
    manager_id = owner.manager_id

    if not owner:
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "No tenant user is linked to that email.",
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    elif manager_id != user_id:
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "You are not a manager for this user. Connect with your clients from Contacts page.",
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    if artifact_type in type_val_manager:
        # Create and insert artifact
        artifact = OwnerArtifact()
        if title:
            artifact.title = title
        artifact.artifact_json = artifact_json
        artifact.artifact_type = artifact_type
        artifact.owner_id = owner_id
        artifact.manager_id = user_id

        db.session.add(artifact)
        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["CREATED"],
            mimetype="application/json",
        )

    else:
        return Response(
            json.dumps(
                {
                    "success": False,
                    "error": "You can't create an item of type {} for a property owner.".format(artifact_type),
                    "token": token_payload,
                }
            ),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )


#######################################################################################


"""
    USE THIS TO GET AND UPDATE STUFF FROM MANAGER TO OWNER
    RESPOND TO: connection_from_owner, request_listing, request_unsliting
    (ACCESSED BY MANAGER ONLY)
"""


@artifact.route("/admin/owner/<int:owner_id>/artifacts/<int:artifact_id>", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def owner_artifact_update(owner_id, artifact_id, token_payload) -> Response:

    user_id = token_payload["user_id"]

    artifact = OwnerArtifact.query.filter_by(
        owner_id=owner_id, artifact_id=artifact_id, manager_id=user_id).first()

    if not artifact:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

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

    if request.method == "PATCH":
        """
        MAY VARY
        data = {}
        """
        data = request.get_json()
        artifact_type = artifact.artifact_type.value
        listing = ArtifactType.request_listing.value
        unlisting = ArtifactType.request_unlisting.value
        repair = ArtifactType.request_repair.value
        extension = ArtifactType.request_lease_extension.value
        approved_by_owner = ArtifactStatus.approved_by_owner.value

        # Listing Request, Unlisting Request, Connection Request
        if artifact_type in [
            listing,
            unlisting,
            repair,
            extension,
            ArtifactType.connection_from_owner.value,
        ]:
            status = data.get("status")
            approved = status == ArtifactStatus.approved_by_manager.value
            denied = status == ArtifactStatus.denied_by_manager.value
            if not any([approved, denied]):
                return Response(
                    json.dumps(
                        {"success": False, "error": "Please provide a valid response.", "token": token_payload}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            if artifact_type in [repair, extension] and (artifact.status.value != approved_by_owner):
                return Response(
                    json.dumps(
                        {"success": False, "error": "Owner's approval is required."}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            artifact.status = status
            db.session.commit()
            return Response(
                json.dumps({"success": True, "token": token_payload}),
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


#######################################################################################


@artifact.route("/admin/artifacts", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def access_sent_reports(token_payload):
    user_id = token_payload['user_id']
    
    tenant_artifacts = db.session.query(TenantArtifact, AbstractUser).\
                        filter_by(manager_id=user_id).\
                        filter(TenantArtifact.artifact_type==ArtifactType.report_due).\
                        join(AbstractUser, TenantArtifact.tenant_id==AbstractUser.user_id).\
                        order_by(TenantArtifact.artifact_date.desc()).all()
                       
    Parent = aliased(CustomTemplate)
    custom_templates = CustomTemplate.query.filter_by(manager_id=user_id).\
                       join(Parent, CustomTemplate.parent_template==Parent.template_id).\
                       with_entities(
                        CustomTemplate.template_json,
                        CustomTemplate.template_date,
                        CustomTemplate.title,
                        Parent.title.label('parent'),
                       ).all()
                       
    tenant_artifact_list = []
    for artifact in tenant_artifacts:
        tenant_artifact = {
            'artifact_date': artifact.TenantArtifact.artifact_date.strftime('%Y-%m-%d'),
            'artifact_json': artifact.TenantArtifact.artifact_json,
            'status': str(artifact.TenantArtifact.status),
            'email': artifact.AbstractUser.email,
            'user_id': artifact.AbstractUser.user_id,
            'name': artifact.AbstractUser.first_name+' '+artifact.AbstractUser.last_name,
            'report_type': 'Self Inspection Report',
            'parent_template': 'Self Inspection Report',
        } 
        
        found_template = False
        for temp in custom_templates:
            
            if temp.template_date==tenant_artifact['artifact_date'] and temp.template_json.get('components'):
                jsons = temp.template_json.get('components')
                for comp in jsons:
                    if comp['label'] == 'Tenant Email (required)' \
                        and (comp['value']['props']['subtitle']==artifact.AbstractUser.email):
                        
                        current_app.logger.info(temp.title)
                        tenant_artifact['report_type'] = temp.title
                        tenant_artifact['parent_template'] = temp.parent
                        found_template = True
                        break
                if found_template:
                    break
        
        tenant_artifact_list.append(tenant_artifact)

    current_app.logger.info(tenant_artifact_list)
    return Response(
                json.dumps(
                    {"artifact_list": tenant_artifact_list}),
                status=RESPONSE_STATUS["OK"],
                mimetype="application/json",
            ) 