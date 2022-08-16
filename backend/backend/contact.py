import re

from flask import Blueprint, Response, json, request
from flask_cors import cross_origin

from . import db
from .constants import RESPONSE_STATUS, ArtifactType, UserStatus
from .models import (AbstractUser, Contact, Owner, OwnerArtifact, Property, Tenant,
                     TenantArtifact)
from .utils import auth_required

contact = Blueprint("contact", __name__)


@contact.route("/admin/contacts", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required
def contacts(token_payload) -> Response:

    user_id = token_payload["user_id"]
    user_status = token_payload["status"]

    if request.method == "GET":
        contacts_list = []
        if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
            if user_status == UserStatus.online_tenant.value:
                manager_id = Tenant.query.filter_by(
                    tenant_id=user_id).first().manager_id
            elif user_status == UserStatus.online_owner.value:
                manager_id = Owner.query.filter_by(
                    owner_id=user_id).first().manager_id

            if manager_id:
                manager = AbstractUser.query.filter_by(
                    user_id=manager_id).first()
                contacts_list = [
                    {
                        "first_name": manager.first_name,
                        "last_name": manager.last_name,
                        "email": manager.email,
                    }
                ]

        elif user_status == UserStatus.online_manager.value:
            contacts = Contact.query.filter_by(
                manager_id=user_id, connected=True).all()
            contacts_list = [
                {
                    "email": contact.email,
                    "preferred_name": contact.preferred_name,
                    "contact_id": contact.contact_id,
                    "tenant": contact.tenant,
                    "owner": contact.owner,
                    "phone_number": contact.phone_number,
                    "user_id": contact.user_id,
                }
                for contact in contacts
            ]

        return Response(
            json.dumps({"contacts_list": contacts_list,
                       "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    # POST Contact
    if request.method == "POST":
        if user_status in [UserStatus.online_tenant.value, UserStatus.online_owner.value]:
            # User is Tenant/Owner and wants to connect with Manager
            manager_email = request.get_json().get("email")
            manager = AbstractUser.query.filter_by(email=manager_email).first()
            if not manager:
                return Response(
                    json.dumps(
                        {"success": False, "error": "No property manager linked to that email address."}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            if user_status == UserStatus.online_tenant.value:
                connected = Tenant.query.filter_by(
                    tenant_id=user_id).first().manager_id == manager.user_id
                if not connected:
                    # connection_from_tenant artifact
                    user = AbstractUser.query.filter_by(
                        user_id=user_id).first()
                    user_name = user.first_name + " " + user.last_name
                    artifact = TenantArtifact()
                    artifact.artifact_json = {"name": user_name}
                    artifact.artifact_type = ArtifactType.connection_from_tenant
                    artifact.tenant_id = user_id
                    artifact.manager_id = manager.user_id
                    db.session.add(artifact)
                    db.session.commit()

            elif user_status == UserStatus.online_owner.value:
                connected = Owner.query.filter_by(
                    owner_id=user_id).first().manager_id == manager.user_id
                if not connected:
                    # connection_from_owner artifact
                    user = AbstractUser.query.filter_by(
                        user_id=user_id).first()
                    user_name = user.first_name + " " + user.last_name
                    artifact = OwnerArtifact()
                    artifact.artifact_json = {"name": user_name}
                    artifact.artifact_type = ArtifactType.connection_from_owner
                    artifact.owner_id = user_id
                    artifact.manager_id = manager.user_id
                    db.session.add(artifact)
                    db.session.commit()

            # Tenant/Owner is already connected with a manger
            if connected:
                return Response(
                    json.dumps(
                        {"success": False, "error": "You are already connected with a property manager."}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["CREATED"],
                mimetype="application/json",
            )

        # User is manager and wants to connect with Tenant/Owner
        elif user_status == UserStatus.online_manager.value:
            """
            data = {"email":<string>,
                    "preferred_name":<string>,
                    "phone_number":<string>,
                    "tenant":<boolean>
                    "owner":<boolean>
                    }
            """
            data = request.get_json()
            email = data.get("email")
            preferred_name = data.get("preferred_name")
            phone_number = data.get("phone_number")
            tenant = True if str(data.get("tenant")).lower() in [
                "true", "1"] else False
            owner = True if str(data.get("owner")).lower() in [
                "true", "1"] else False

            if not email:
                return Response(
                    json.dumps(
                        {"success": False, "error": "Please provide an email.", "token": token_payload}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            if re.match(r"[a-zA-Z0-9_\-]+@[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+", email) is None:
                return Response(
                    json.dumps(
                        {"success": False, "error": "Invalid email address.", "token": token_payload}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            if not any([tenant, owner]):
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "Please pick at least one role for the contact.",
                            "token": token_payload,
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            existing_email = Contact.query.filter_by(email=email).first()
            if existing_email:
                if existing_email.manager_id == user_id and existing_email.connected:
                    error = "You already have a contact with this email."
                elif existing_email.manager_id == user_id and not existing_email.connected:
                    error = "Pending connection request with a user with this email."
                elif existing_email.connected:
                    error = "This user is already connected with another manager."
                else:
                    error = "Something else has gone wrong, please try again later."
                return Response(
                    json.dumps({"success": False, "error": error, }),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            existing_phone = Contact.query.filter_by(
                phone_number=phone_number).first()
            if existing_phone:
                if existing_phone.manager_id == user_id and existing_phone.connected:
                    error = "You already have a contact with this phone number."
                elif existing_phone.manager_id == user_id and not existing_phone.connected:
                    error = "Pending connection request with a user with this phone number."
                elif existing_phone.connected:
                    error = "This phone is already connected with another manager."
                else:
                    error = "Something else has gone wrong, please try again later."
                return Response(
                    json.dumps({"success": False, "error": error, }),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            existing_name = Contact.query.filter_by(
                preferred_name=preferred_name, manager_id=user_id).first() if preferred_name else False
            if existing_name:
                if existing_name.connected:
                    error = "You already have a contact with this name."
                else:
                    error = "Pending connection request with a user with this name."
                return Response(
                    json.dumps({"success": False, "error": error, }),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            contact = AbstractUser.query.filter_by(email=email).first()

            if not contact:
                return Response(
                    json.dumps(
                        {"success": False, "error": "No user linked to that email address.",
                            "token": token_payload}
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            # Manager connecting with Tenant but the user is not registered as Tenant
            if tenant and not contact.tenant:
                return Response(
                    json.dumps(
                        {"success": False, "error": "This user is not registered as a tenant.",
                            "token": token_payload}
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            # Manager connecting with Owner but the user is not registered as Owner
            if owner and not contact.owner:
                return Response(
                    json.dumps(
                        {
                            "success": False,
                            "error": "This user is not registered as a property owner.",
                            "token": token_payload,
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            # Create contact entry
            new_contact = Contact()
            if preferred_name:
                new_contact.preferred_name = preferred_name
            if phone_number:
                new_contact.phone_number = phone_number
            new_contact.email = email

            new_contact.tenant = True if tenant else False
            new_contact.owner = True if owner else False
            new_contact.user_id = contact.user_id
            new_contact.manager_id = user_id
            db.session.add(new_contact)

            # if tenant and not connected -> create connection artifact -> automatically triggers a notificaiton for the tenant
            if tenant:
                connected = Tenant.query.filter_by(
                    tenant_id=contact.user_id).first().manager_id == user_id
                if not connected:
                    user = AbstractUser.query.filter_by(
                        user_id=user_id).first()
                    user_name = user.first_name + " " + user.last_name
                    tenant_artifact = TenantArtifact()
                    tenant_artifact.artifact_json = {"name":user_name}
                    tenant_artifact.artifact_type = ArtifactType.connection_from_manager.value
                    tenant_artifact.tenant_id = contact.user_id
                    tenant_artifact.manager_id = user_id
                    db.session.add(tenant_artifact)

            # if owner and not connected -> create connection artifact -> automatically triggers a notificaiton for the owner
            if owner:
                connected = Owner.query.filter_by(
                    owner_id=contact.user_id).first().manager_id == user_id
                if not connected:
                    user = AbstractUser.query.filter_by(
                        user_id=user_id).first()
                    user_name = user.first_name + " " + user.last_name
                    owner_artifact = OwnerArtifact()
                    owner_artifact.artifact_json = {"name":user_name}
                    owner_artifact.artifact_type = ArtifactType.connection_from_manager.value
                    owner_artifact.owner_id = contact.user_id
                    owner_artifact.manager_id = user_id
                    db.session.add(owner_artifact)

            db.session.commit()

            return Response(
                json.dumps({"success": True, "token": token_payload}),
                status=RESPONSE_STATUS["CREATED"],
                mimetype="application/json",
            )


@contact.route("/admin/contacts/<int:contact_id>", methods=["GET", "PATCH", "DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def contact_update(contact_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    contact = Contact.query.filter_by(
        contact_id=contact_id, manager_id=user_id).first()
    if not contact:
        return Response(
            json.dumps({"success": False, "error": "No contact available."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )
    if not contact.connected:
        return Response(
            json.dumps(
                {"success": False, "error": "Pending connection request."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    prop = Property.query.filter_by(tenant_id=contact.user_id).first()
    contact_dict = {
        "email": contact.email,
        "preferred_name": contact.preferred_name,
        "contact_id": contact.contact_id,
        "tenant": contact.tenant,
        "owner": contact.owner,
        "phone_number": contact.phone_number,
        "user_id": contact.user_id,
        "property_id": None if not prop else prop.property_id,
        "address": None if not prop else prop.address,
    }

    if request.method == "GET":
        return Response(
            json.dumps({"contact": contact_dict, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "PATCH":
        """
            data = {
                    "preferred_name":<string>,
                    "phone_number":<string>,
                    "tenant":<boolean>
                    "owner":<boolean>
                    "user_id":<integer>
                    }
        """
        data = request.get_json()
        preferred_name = str(data.get("preferred_name")) if data.get(
            "preferred_name") else False
        phone_number = str(data.get("phone_number")) if data.get(
            "phone_number") else False
        tenant = True if str(data.get("tenant")).lower() in [
            "true", "1"] else False
        owner = True if str(data.get("owner")).lower() in [
            "true", "1"] else False

        if phone_number:
            existing_phone = db.session.query(Contact).filter(
                Contact.phone_number == phone_number, Contact.manager_id == user_id, Contact.contact_id != contact_id).first()
            if existing_phone:
                if existing_phone.connected:
                    error = "You already have another contact with this phone number."
                else:
                    error = "Pending connection request with another user with this phone number."
                return Response(
                    json.dumps({"success": False, "error": error, }),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
        if preferred_name:
            existing_name = db.session.query(Contact).filter(
                Contact.preferred_name == preferred_name, Contact.manager_id == user_id, Contact.contact_id != contact_id).first()
            if existing_name:
                if existing_name.connected:
                    error = "You already have a contact with this name."
                else:
                    error = "Pending connection request with a user with this name."
                return Response(
                    json.dumps({"success": False, "error": error, }),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

        contact_user = AbstractUser.query.filter_by(
            user_id=contact.user_id).first()
        # manager is updating a contact to tenant but the user is not registered as tenant
        if tenant and not contact_user.tenant:
            return Response(
                json.dumps(
                    {"success": False, "error": "This user is not registered as a tenant."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )
        # manager is updating a contact to owner but the user is not registered as tenant
        if owner and not contact_user.owner:
            return Response(
                json.dumps(
                    {"success": False, "error": "This user is not registered as a property owner."}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

        # Successfully updating
        if preferred_name:
            contact.preferred_name = preferred_name
        if phone_number:
            contact.phone_number = phone_number
        contact.tenant = tenant
        contact.owner = owner
        db.session.commit()

        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    if request.method == "DELETE":
        db.session.delete(contact)
        db.session.commit()
        return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
