import re

from flask import Blueprint, Response, current_app, json, request
from flask_cors import cross_origin
from werkzeug.security import check_password_hash, generate_password_hash

from . import db
import datetime as dt
from operator import or_
from .constants import (PASSWORD_HASH, RESPONSE_STATUS, ROLE, ArtifactStatus,
                        ArtifactType, InspectionStatus, SourceType, UserStatus)
from .models import (AbstractUser, Contact, Property, Inspection, Manager, ManagerArtifact, Owner,
                     OwnerArtifact, Tenant, TenantArtifact, TokenBlacklist)
from .utils import auth_required, set_offline

auth = Blueprint("auth", __name__)


@auth.route("/admin/auth/register", methods=["POST"])
@cross_origin(origin="*")
@auth_required(check_token=False, gen_token_on_error=False)
def register_post(token_payload) -> Response:
    data = request.get_json()

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")
    secret_question = data.get("securityQuestion")
    secret_answer = data.get("securityAnswer")
    tenant = data.get("tenant")
    manager = data.get("manager")
    owner = data.get("owner")
    data_keys = [first_name, last_name, email, password, tenant, manager, owner, secret_question, secret_answer]

    if None in data_keys or "" in data_keys:
        print(f"{[i for i, key in enumerate(data_keys) if key == None or key == '']}")
        return Response(
            json.dumps({"error": "Please supply values for all fields."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    if not manager and not owner and not tenant:
        return Response(
            json.dumps({"error": "At least one of tenant, manager, or owner must be selected for account creation."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    # check for valid email
    if re.match(r"[a-zA-Z0-9_\-]+@[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+", email) is None:
        return Response(
            json.dumps({"error": "Invalid email address."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    user = AbstractUser.query.filter_by(email=email).first()
    if user:
        return Response(
            json.dumps({"error": "An account already exists with this email address."}),
            status=RESPONSE_STATUS["FORBIDDEN"],
            mimetype="application/json",
        )

    # create a new AbstractUser with the form data. Hash the password so the plaintext version isn"t saved.
    user_attributes = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password_hash": generate_password_hash(password, method=PASSWORD_HASH),
        "secret_question": secret_question,
        "secret_answer_hash": generate_password_hash(secret_answer, method=PASSWORD_HASH),
        "tenant": tenant,
        "manager": manager,
        "owner": owner,
    }
    new_user = AbstractUser(**user_attributes)

    # add the new AbstractUser to the database
    db.session.add(new_user)
    db.session.commit()
    return Response(
        json.dumps({"user_id": new_user.user_id}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@auth.route("/admin/auth/login", methods=["POST"])
@cross_origin(origin="*")
@auth_required(check_token=False, gen_token_on_error=False)
def login_post(token_payload) -> Response:
    data = request.get_json()
    current_app.logger.info(f"{data}")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if email is None:
        return Response(
            json.dumps({"error": "Please supply an email address for login."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    if password is None:
        return Response(
            json.dumps({"error": "Please supply a password for login."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    user = AbstractUser.query.filter_by(email=email).first()

    if not user:
        return Response(
            json.dumps({"error": "No account exists for this email address."}),
            status=RESPONSE_STATUS["FORBIDDEN"],
            mimetype="application/json",
        )
    if getattr(user, ROLE[role]) != True:
        return Response(
            json.dumps({"error": f"This account is not linked to the role of {role}, please select a new role."}),
            status=RESPONSE_STATUS["FORBIDDEN"],
            mimetype="application/json",
        )

    if not check_password_hash(user.password_hash, password):
        return Response(
            json.dumps({"error": "Password is incorrect."}),
            status=RESPONSE_STATUS["FORBIDDEN"],
            mimetype="application/json",
        )

    # update logged in status
    user = db.session.query(AbstractUser).filter_by(user_id=user.user_id).first()
    user.status = getattr(UserStatus, "online_" + role).name
    db.session.commit()

    return Response(
        json.dumps({"user_id": user.user_id}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@auth.route("/admin/auth/logout", methods=["POST"])
@cross_origin(origin="*")
@auth_required(gen_token=False)
def logout_post(token_payload) -> Response:
    # update user status
    set_offline(token_payload)

    return Response(
        json.dumps({"message": "Successfully logged out."}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@auth.route("/admin/manager/home")
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def manager_homepage(token_payload) -> Response:
    user = AbstractUser.query.filter_by(user_id=token_payload.get("user_id")).first()

    clients = Contact.query.filter_by(manager_id=user.user_id)
    owner_clients = [client for client in clients if client.owner]
    tenant_clients = [client for client in clients if client.tenant]

    properties = Property.query.filter_by(manager_id=user.user_id)
    leased_properties = [prop for prop in properties if prop.leased]
    unleased_properties = [prop for prop in properties if not prop.leased]
    unique_post_codes = {prop.post_code for prop in properties}
    post_codes_proportions = {
        int(pc): len([prop for prop in properties if prop.post_code == pc])
        for pc in unique_post_codes
    }
    current_app.logger.debug([prop.lease_expiration_date for prop in properties if prop in leased_properties])
    upcoming_expirations = [
        prop.lease_expiration_date for prop in leased_properties
        if prop.lease_expiration_date and prop.lease_expiration_date < (dt.datetime.today() + dt.timedelta(days=30)).date()
    ]

    inspections = Inspection.query.filter(
        Inspection.manager_id==user.user_id, 
        or_(
            Inspection.status==InspectionStatus.scheduled.value,
            Inspection.status==InspectionStatus.rescheduled.value,
        )
    )
    upcoming_inspections = [
        insp for insp in inspections
        if insp.inspection_date and insp.inspection_date < (dt.datetime.today() + dt.timedelta(days=7)).date()
    ]

    pending_reports = TenantArtifact.query.filter(
        TenantArtifact.manager_id == user.user_id,
        TenantArtifact.artifact_type == ArtifactType.report_due.value,
        TenantArtifact.status == ArtifactStatus.pending,
    )

    return Response(
        json.dumps({
            "number_of_clients": clients.count(),
            "number_of_owner_clients": len(owner_clients),
            "number_of_tenant_clients": len(tenant_clients),
            "num_leased_properties": len(leased_properties),
            "num_unleased_properties": len(unleased_properties),
            "post_code_stats": post_codes_proportions,
            "num_upcoming_lease_expirations": len(upcoming_expirations),
            "num_upcoming_inspections": len(upcoming_inspections),
            "num_pending_reports_due": pending_reports.count(),
        }),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )

@auth.route("/admin/owner/home")
@cross_origin(origin="*")
@auth_required(access_right=["owner"])
def owner_homepage(token_payload) -> Response:
    # get auth token
    user = AbstractUser.query.filter_by(user_id=token_payload["user_id"]).first()
    all_properties = Property.query.filter(
        Property.owner_id == user.user_id
    )
    listed_properties = [
        prop for prop in all_properties
        if prop.manager_id is not None
    ]
    leased_properties = [
        prop for prop in all_properties
        if prop.leased
    ]

    return Response(
        json.dumps({
            "number_of_properties": all_properties.count(),
            "number_of_listed_properties": len(listed_properties),
            "number_of_leased_properties": len(leased_properties)
        }),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@auth.route("/admin/tenant/home")
@cross_origin(origin="*")
@auth_required(access_right=["tenant"])
def tenant_homepage(token_payload) -> Response:
    user = AbstractUser.query.filter_by(user_id=token_payload["user_id"]).first()

    current_app.logger.debug(1)
    expiration_date = Property.query.filter(
        Property.tenant_id == user.user_id
    ).first()

    if not expiration_date or not expiration_date.lease_expiration_date:
        return Response(
            json.dumps({
                "days_to_expiry": 0,
                "num_requests": 0,
                "pending_requests": 0,
                "num_reports_due": 0,
            }),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    expiration_date = expiration_date.lease_expiration_date

    current_app.logger.debug(expiration_date)
    days_to_expiry = (expiration_date - dt.datetime.today().date()).days
    current_app.logger.debug(2)

    all_requests = TenantArtifact.query.filter(
        TenantArtifact.tenant_id == user.user_id,
        TenantArtifact.artifact_type.in_([
            ArtifactType.request_repair.value,
            ArtifactType.request_lease_extension.value,
            ArtifactType.notice_leave.value,
        ]),
    )
    current_app.logger.debug(3)
    pending_requests = [req for req in all_requests if req.status == ArtifactStatus.pending.value]
    current_app.logger.debug(4)

    reports_due = TenantArtifact.query.filter(
        TenantArtifact.tenant_id == user.user_id,
        TenantArtifact.artifact_type == ArtifactType.report_due.value,
        TenantArtifact.status == ArtifactStatus.pending.value,
    )
    current_app.logger.debug(5)

    return Response(
        json.dumps({
            "days_to_expiry": days_to_expiry,
            "num_requests": all_requests.count(),
            "pending_requests": len(pending_requests),
            "num_reports_due": reports_due.count(),
        }),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )

