import datetime as dt
from flask import Blueprint, Response, json, request, current_app
from flask_cors import cross_origin

from . import db
from .constants import RESPONSE_STATUS
from .models import DefaultTemplate, CustomTemplate, AbstractUser, Tenant
from .utils import auth_required, loadJSON

from .constants import UserStatus

template = Blueprint("template", __name__)


# Use this to get list of all templates
@template.route("/admin/templates", methods=["GET", "POST"])
@cross_origin(origin="*")
@auth_required()
def templates(token_payload) -> Response:

    user_id = token_payload["user_id"]
    role = token_payload["status"]

    if request.method == "GET":
        default_templates = DefaultTemplate.query.all()
        default_templates_list = [
            {
                "template_id": temp.template_id,
                "template_json": temp.template_json,
                "title": temp.title,
                "description": temp.description,
            }
            for temp in default_templates
        ]

        custom_templates = CustomTemplate.query.filter_by(manager_id=user_id)
        custom_templates_list = []
        current_app.logger.debug(custom_templates)
        for temp in custom_templates:
            current_app.logger.debug(temp)
            parent = [
                default["title"] for default in default_templates_list if default["template_id"] == temp.parent_template
            ][0]
            custom_templates_list.append(
                {
                    "template_id": temp.template_id,
                    "template_json": temp.template_json,
                    "title": temp.title,
                    "description": temp.description,
                    "date": temp.template_date,
                    "parent_template": parent,
                }
            )

        return Response(
            json.dumps({"success": True, "data": {"default":default_templates_list, "custom":custom_templates_list}}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )

    
    if request.method == "POST":
        """
        data = {
                "template_json":<json>,
                "title":<string>,
                "description":<string>,
                "parent_template":int,
                }
        """
        data = request.get_json()
        template_json = json.loads(data.get("template_json"))
        title = data.get("title")
        description = data.get("description")
        date = dt.datetime.now().date().isoformat()
        parent_template = data.get("parent_template")
        
        if role == UserStatus.online_manager.value:
            tenant_email = data.get("email")
            tenant = (
                AbstractUser.query.filter(AbstractUser.email == tenant_email)
                .join(Tenant, AbstractUser.user_id == Tenant.tenant_id)
                .filter(Tenant.manager_id==user_id)
                .first()
            )
            if not tenant:
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
        # Add template to custom templates
        temp = CustomTemplate()
        temp.template_json = template_json
        if title:
            temp.title = title
        if description:
            temp.description = description
        temp.template_date = date
        temp.parent_template = parent_template
        temp.manager_id = user_id

        db.session.add(temp)
        db.session.commit()

        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["CREATED"],
            mimetype="application/json",
        )


# Use this to get default template
@template.route("/admin/templates/default/<int:template_id>", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def templates_default(template_id, token_payload) -> Response:
    
    temp = DefaultTemplate.query.filter_by(template_id=template_id).first()
    temp = {
            "template_id": temp.template_id,
            "template_json": temp.template_json,
            "title": temp.title,
            "description": temp.description,
            }

    return Response(
        json.dumps({"success": True, "data": temp}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )


# Use this to get/patch custom template
@template.route("/admin/templates/custom/<int:template_id>", methods=["GET", "PATCH", "DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager"])
def templates_custom(template_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    
    temp = CustomTemplate.query.filter_by(template_id=template_id, manager_id=user_id).first()

    if not temp:
        return Response(
            json.dumps({"success": False, "error": "Item not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )

    if request.method == "GET":
        temp = {
            "template_id": temp.template_id,
            "template_json": temp.template_json,
            "title": temp.title,
            "description": temp.description,
            "date": temp.date,
            "parent_template": temp.parent_template,
        }
        return Response(
            json.dumps({"success": True, "data": temp}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
        

    if request.method == "PATCH":
        """
        data = {
                ["template_json":<json>],
                ["title":<string>],
                ["description":<string>],
                }
        """
        data = request.get_json()
        if data.get("template_json"):
            temp.template_json = data.get("template_json")
        if data.get("title"):
            temp.title = data.get("title")
        if data.get("description"):
            temp.description = data.get("description")
        
        db.session.commit()

        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
        
    if request.method == "DELETE":
        db.session.delete(temp)
        db.session.commit()
        return Response(
            json.dumps({"success": True}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )