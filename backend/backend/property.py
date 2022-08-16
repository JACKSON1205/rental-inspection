import os
import uuid
from typing import Union
import datetime as dt

import geocoder
from flask import Blueprint, current_app, json, request
from flask.wrappers import Response
from flask_cors import cross_origin
from sqlalchemy.orm import aliased
from werkzeug.datastructures import MultiDict
from wtforms import BooleanField, Form, IntegerField, StringField, validators

from . import db
from .constants import (PROPERTY_IMG_BASE_DIR, PROPERTY_IMG_ORIGINAL_PATH,
                        PROPERTY_IMG_THUMBNAIL_PATH, RESPONSE_STATUS,
                        UserStatus)
from .models import (AbstractUser, Inspection, ManagerPropertySettings,
                     OwnerPropertySettings, Property, Tenant)
from .utils.images import encode_image, resize_by_size
from .utils.utils import auth_required

property_api = Blueprint("property_api", __name__)


def is_role(email, role):
    filters = {"email": email, role: role}
    as_role = AbstractUser.query.filter_by(**filters).first()

    return False if not as_role else True


def get_properties_list(filters: dict = {}):
    """
    filter properties

    Inputs:
    - filters: dict like, default, return all properties

    Returns:
    - property_list: list of properties
    """

    manager = aliased(AbstractUser)
    tenant = aliased(AbstractUser)
    owner = aliased(AbstractUser)

    properties = (
        db.session.query(
            Property,
            ManagerPropertySettings,
            manager.email.label("manager_email"),
            owner.email.label("owner_email"),
            tenant.email.label("tenant_email"),
        )
        .join(manager, manager.user_id == Property.manager_id, isouter=True)
        .join(tenant, tenant.user_id == Property.tenant_id, isouter=True)
        .join(owner, owner.user_id == Property.owner_id, isouter=True)
        .join(ManagerPropertySettings, Property.property_id == ManagerPropertySettings.property_id, isouter=True)
    )
    # filters = {leasd: True}
    if filters:
        # formatting conditions
        filters = {
            Property: {
                "leased": filters.get("leased"),
                "post_code": filters.get("post_code"),
            },
            manager: {
                "email": filters.get("manager_email"),
            },
            tenant: {
                "email": filters.get("tenant_email"),
            },
            owner: {
                "email": filters.get("owner_email"),
            },
        }

        filters = {table: {k: v for k, v in cols.items() if not v is None}
                   for table, cols in filters.items()}

        for table, columns in filters.items():
            for attr, value in columns.items():
                properties = properties.filter(getattr(table, attr) == value)

    properties = properties.all()

    property_list = []

    for prop in properties:
        property_list.append(
            {
                "property_id": prop.Property.property_id,
                "address": prop.Property.address,
                "post_code": str(prop.Property.post_code),
                "map_lat": str(prop.Property.map_lat),
                "map_long": str(prop.Property.map_long),
                "leased": prop.Property.leased,
                "manager_thumbnail": encode_image(prop.ManagerPropertySettings.img_dir)
                if prop.ManagerPropertySettings
                else "",
            }
        )
        if filters and filters[Property].get("leased"):
            tenant_id = Property.query.filter_by(
                property_id=prop.Property.property_id).first().tenant_id
            property_list[-1] = {
                **property_list[-1],
                **{
                    "tenant_first_name": tenant.query.filter_by(user_id=tenant_id).first().first_name,
                    "tenant_last_name": tenant.query.filter_by(user_id=tenant_id).first().last_name,
                },
            }

    return property_list, None


def get_property_details(property_id):
    prop = (
        db.session.query(
            Property,
            ManagerPropertySettings,
            OwnerPropertySettings
        )
        .filter(Property.property_id == property_id)
        .join(ManagerPropertySettings, Property.property_id == ManagerPropertySettings.property_id, isouter=True)
        .join(OwnerPropertySettings, Property.property_id == OwnerPropertySettings.property_id, isouter=True)
        .first()
    )
    if not prop:
        return None, "Invalid property"

    property_details = {
        "property_id": prop.Property.property_id,
        "address": prop.Property.address,
        "post_code": str(prop.Property.post_code),
        "map_lat": str(prop.Property.map_lat),
        "map_long": str(prop.Property.map_long),
        "leased": prop.Property.leased,
        "lease_expiration_date": prop.Property.lease_expiration_date.strftime('%Y-%m-%d') if prop.Property.lease_expiration_date else "",
        "manager_first_name": "",
        "manager_last_name": "",
        "manager_email": "",
        "tenant_first_name": "",
        "tenant_last_name": "",
        "tenant_email": "",
        "owner_first_name": "",
        "owner_last_name": "",
        "owner_email": "",
        "manager_thumbnail": encode_image(prop.ManagerPropertySettings.img_dir) if prop.ManagerPropertySettings else "",
        "owner_thumbnail": encode_image(prop.OwnerPropertySettings.img_dir) if prop.OwnerPropertySettings else "",
    }

    if prop.Property.manager_id:
        manager = AbstractUser.query.filter(
            AbstractUser.user_id == prop.Property.manager_id).first()
        property_details.update(
            {
                "manager_first_name": manager.first_name,
                "manager_last_name": manager.last_name,
                "manager_email": manager.email,
            }
        )
    if prop.Property.tenant_id:
        tenant = AbstractUser.query.filter(
            AbstractUser.user_id == prop.Property.tenant_id).first()
        property_details.update(
            {
                "tenant_first_name": tenant.first_name,
                "tenant_last_name": tenant.last_name,
                "tenant_email": tenant.email,
            }
        )
    if prop.Property.owner_id:
        owner = AbstractUser.query.filter(
            AbstractUser.user_id == prop.Property.owner_id).first()
        property_details.update(
            {
                "owner_first_name": owner.first_name,
                "owner_last_name": owner.last_name,
                "owner_email": owner.email,
            }
        )

    return property_details, None


def update_image(img, property_id: int, user_id: int, status: int) -> Union[str, str]:
    img_formats = {"jpg", "jpeg", "bmp", "png"}
    suffix = img.filename.split(".")[-1].lower()
    try:
        if suffix not in img_formats:
            return None, "Error: Image format is not supported"
        suffix = "." + suffix
    except Exception as e:
        return None, "fail to get the suffix of image"

    table = None
    # only owners and managers can update images
    if status == UserStatus.online_manager.value:
        table = ManagerPropertySettings
    elif status == UserStatus.online_owner.value:
        table = OwnerPropertySettings

    img_name = str(property_id) + "-" + str(user_id) + "-" + uuid.uuid4().hex
    orig_path = PROPERTY_IMG_BASE_DIR + PROPERTY_IMG_ORIGINAL_PATH + img_name + suffix
    thum_path = PROPERTY_IMG_BASE_DIR + \
        PROPERTY_IMG_THUMBNAIL_PATH + img_name + "-thumbnail" + suffix

    img.save(orig_path)
    error = resize_by_size(orig_path, thum_path)
    if error:
        return None, "Fails to resize image"
    id_types = {
        UserStatus.online_owner.value: "owner_id",
        UserStatus.online_manager.value: "manager_id",
    }
    settings = db.session.query(table).filter_by(
        property_id=property_id).first()
    if not settings:
        settings_attributes = {"property_id": property_id,
                               "img_dir": thum_path, id_types[status]: user_id}
        new_img = table(**settings_attributes)

        db.session.add(new_img)

    else:
        settings.img_dir = thum_path

    db.session.commit()

    current_app.logger.info("User_id {} update image for property {}.".format(user_id, property_id))
    return [orig_path, thum_path], None


@property_api.route("/admin/properties", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required
def access_properties(token_payload):
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
    user = AbstractUser.query.filter_by(user_id=user_id).first()
    manager_email = user.email if user.status == UserStatus.online_manager else None
    owner_email = user.email if user.status == UserStatus.online_owner else None
    tenant_email = user.email if user.status == UserStatus.online_tenant else None
    current_app.logger.info(f"Received {token_payload}")

    form = request.get_json()
    current_app.logger.info(f"Form: {form}")

    if request.method == "GET":
        filters = {
            "manager_email": manager_email,
            "owner_email": owner_email,
            "tenant_email": tenant_email,
        }
        property_list, _ = get_properties_list(filters)
    elif request.method == "PATCH":
        filters = {
            "leased": form.get("leased"),
            "manager_email": form.get("manager_email") or manager_email,
            "owner_email": form.get("owner_email") or owner_email,
            "tenant_email": form.get("tenant_email") or tenant_email,
            "post_code": form.get("post_code"),
        }

        property_list, _ = get_properties_list(filters)
    else:
        msg = "invalid request method"
        current_app.logger.error(msg)
        return Response(
            json.dumps({"error": msg}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    info = {
        "property_list": property_list,
    }

    current_app.logger.info("User_id {} access property list.".format(user_id))
    return Response(
        json.dumps(info),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@property_api.route("/admin/properties/<int:property_id>", methods=["GET"])
@cross_origin(origin="*")
@auth_required
def access_property(property_id, token_payload):
    property_details, error = get_property_details(property_id)
    if error:
        msg = error
        current_app.logger.error(msg)
        return Response(
            json.dumps({"error": msg}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
    info = {"property": property_details}
    current_app.logger.info(info)
    return Response(
        json.dumps(info),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@property_api.route("/admin/properties/<int:property_id>", methods=["PATCH"])
@cross_origin(origin="*")
@auth_required(access_right=["manager", "owner"])
def update_property(property_id, token_payload):
    """
    Access properties, this function will return the detail of a property
    that user is interested

    Input:
    - user_info: if auth_headers contain valid token, then return
                  decoded user information, which includes user_id,
                  login role and token. Otherwise return Response
                  with error messages
    - filter_constraints: leased, manager_id, owner_id, tenant_id
                           if a contraint is empty string, then we
                           will ignore it

    Returns:
    - Respond
    """
    user_id = token_payload["user_id"]
    status = token_payload["status"]

    updates = request.form.to_dict()
    """
    mimetype="multipart/form-data"
    manager:
        data = {
            ["leased": <bool>],
            ["tenant_email": <str>],
            ["image": <image>]
        }
        
    mimetype="multipart/form-data"
    owner:
        data = {
            "image":<image>
        }      
    """
    id_types = {
        UserStatus.online_owner.value: "owner_id",
        UserStatus.online_manager.value: "manager_id",
    }
    filters = {"property_id": property_id, id_types[status]: user_id}

    prop_details = Property.query.filter_by(**filters).first()
    if not prop_details:
        msg = "property is not exist or user do not have permission to update property"
        current_app.logger.error(msg)
        return Response(
            json.dumps({"error": msg}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    if status == UserStatus.online_manager.value:
        if "leased" in updates:
            updates['leased'] = True if updates['leased'].lower(
            ) == 'true' else False
            
            inspection = Inspection.query.filter_by(property_id=property_id).first()
            if inspection and not updates['leased']:
                msg = "Please remove all inspections for this property before you unlease it."
                return Response(
                    json.dumps({"error": msg}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            prop_details.leased = updates["leased"]
            if updates["leased"] and updates.get('lease_expiration_date'):
                date = dt.datetime.strptime(
                    updates['lease_expiration_date'], "%Y-%m-%d").date()
                if (
                    prop_details.lease_expiration_date 
                    and date<=prop_details.lease_expiration_date
                ):
                    msg = f"You cannot bring forward a lease expiration date {prop_details.lease_expiration_date}."
                    current_app.logger.error(msg)
                    return Response(
                        json.dumps({"error": msg}),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
                elif (
                    prop_details.lease_expiration_date 
                    and date<=prop_details.lease_expiration_date+dt.timedelta(days=90)
                ):
                    msg = f"Lease expiration extension cannot be less than 90 days after original expiration date {prop_details.lease_expiration_date}."
                    current_app.logger.error(msg)
                    return Response(
                        json.dumps({"error": msg}),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
                elif date <= dt.date.today()+dt.timedelta(days=90):
                    msg = "lease expiration cannot be less than 90 days"
                    current_app.logger.error(msg)
                    return Response(
                        json.dumps({"error": msg}),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
                prop_details.lease_expiration_date = date
            elif not updates["leased"] and prop_details.lease_expiration_date:
                prop_details.lease_expiration_date = None
                prop_details.tenant_id = None
            elif updates['leased'] == False:
                prop_details.tenant_id = None

        if "tenant_email" in updates:
            if not prop_details.leased:
                msg = "Cannot add a tenant to a unleased property."
                current_app.logger.error(msg)
                return Response(
                    json.dumps({"error": msg}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            tenant = AbstractUser.query.filter(
                AbstractUser.email == updates["tenant_email"],
                AbstractUser.tenant == True,
                AbstractUser.status != UserStatus.inactive,
            ).join(Tenant, Tenant.tenant_id==AbstractUser.user_id).\
            filter(Tenant.manager_id==user_id).first()
            if not tenant:
                msg = "Please add the tenant as contact before leasing a property to them."
                current_app.logger.error(msg)
                return Response(
                    json.dumps({"error": msg}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
            if Property.query.filter(Property.tenant_id == tenant.user_id).first():
                return Response(
                    json.dumps({"error": "Tenant is already leased to a property."}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

            prop_details.tenant_id = tenant.user_id

        db.session.commit()
        if "image" in request.files:
            image = request.files.get("image")
            _, error = update_image(image, property_id, user_id, status)
            if error:
                current_app.logger.error(error)
                return Response(
                    json.dumps({"error": error}),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )

    elif status == UserStatus.online_owner.value:
        image = request.files.get("image")
        
        _, error = update_image(image, property_id, user_id, status)
        if error:
            current_app.logger.error(error)
            return Response(
                json.dumps({"error": error}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

    return Response(
        json.dumps({"message": "success"}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


@property_api.route("/admin/properties", methods=["POST"])
@cross_origin(origin="*")
@auth_required(access_right=["owner"])
def add_new_property(token_payload):
    """
    mimetype="multipart/form-data"
    json = {
        "address":<str>,
        "post_code":<str>,
        "leased":<bool>,
        ["image":<base64>]
    }
    """
    user_id = token_payload["user_id"]
    user_status = token_payload["status"]
    prop_details = request.form.to_dict()

    if prop_details.get('leased'):
        prop_details['leased'] = True if prop_details['leased'].lower(
        ) == 'true' else False

    property_form = UpdatePropertyForm(MultiDict(prop_details))
    if not property_form.validate():
        msg = "Error: property information form is invalid"
        current_app.logger.error(msg)
        return Response(
            json.dumps({"error": msg}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    coords = geocoder.mapbox(
        property_form.address, key=os.environ.get("MAPBOX_API_KEY")
    ).latlng
    if coords is None:
        return Response(
            json.dumps({"error": "Invalid Address: the address you supplied cannot be parsed. "
                "Try entering it in a standard format; e.g. \nU(unit number) (street number) (street), (suburb)"}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    [map_lat, map_long] = coords
    if geocoder.reverse((map_lat, map_long), provider="mapbox", key=os.environ.get("MAPBOX_API_KEY")).raw.get("postcode") != str(property_form.post_code.data):
        return Response(
            json.dumps({"error": "Invalid Address: The address you supplied cannot be located within the postcode area you supplied."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )

    property_attributes = {
        "address": str(prop_details["address"]),
        "post_code": int(prop_details["post_code"]),
        "map_lat": map_lat,
        "map_long": map_long,
        "leased": prop_details["leased"],
        "owner_id": user_id,
    }

    new_property = Property(**property_attributes)

    if prop_details["leased"] and prop_details.get('lease_expiration_date'):
        date = dt.datetime.strptime(
            prop_details['lease_expiration_date'], "%Y-%m-%d").date()
        if date <= dt.date.today():
            msg = "lease expiration date invalid"
            current_app.logger.error(msg)
            return Response(
                json.dumps({"error": msg}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )
        new_property.lease_expiration_date = prop_details

    db.session.add(new_property)
    db.session.commit()

    if "image" in request.files:
        image = request.files.get("image")
        
        _, error = update_image(image, new_property.property_id, user_id, user_status)
        if error:
            current_app.logger.error(error)
            return Response(
                json.dumps({"error": error}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )

    owner = AbstractUser.query.filter_by(user_id=user_id).first()
    property_info = {
        "property_id": new_property.property_id,
        "address": new_property.address,
        "post_code": str(new_property.post_code),
        "map_lat": str(new_property.map_lat),
        "map_long": str(new_property.map_long),
        "leased": new_property.leased,
        "owner_first_name": owner.first_name,
        "owner_last_name": owner.last_name,
        "owner_email": owner.email,
    }

    current_app.logger.info(
        f"Adding new contact with attributes {property_attributes}")
    return Response(
        json.dumps({"property": property_info}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


class UpdatePropertyForm(Form):
    address = StringField(
        "address",
        [validators.data_required(), validators.length(min=1, max=255)],
    )
    post_code = IntegerField("post_code", [validators.data_required()])
    leased = BooleanField("leased")
