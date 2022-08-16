import datetime as dt
from enum import Enum
from re import T

import jwt
from flask import current_app
from sqlalchemy import JSON
from sqlalchemy.ext.mutable import MutableDict

from . import db
from .constants import (ArtifactStatus, ArtifactType, ComponentType,
                        InspectionStatus, SourceType, UserStatus)


class AbstractUser(db.Model):

    __tablename__ = "abstract_user"  # table in pmsdb

    # primary keys are required by SQLAlchemy
    user_id = db.Column(db.INTEGER, primary_key=True)
    first_name = db.Column(db.VARCHAR(255))
    last_name = db.Column(db.VARCHAR(255))
    email = db.Column(db.VARCHAR(80))
    password_hash = db.Column(db.CHAR(88))
    secret_question = db.Column(db.VARCHAR(255))
    secret_answer_hash = db.Column(db.CHAR(88))
    tenant = db.Column(db.BOOLEAN, default=False)
    manager = db.Column(db.BOOLEAN, default=False)
    owner = db.Column(db.BOOLEAN, default=False)
    status = db.Column(db.Enum(UserStatus), default=UserStatus.offline)

    def encode_auth_token(self):
        """
        Generates the Auth Token
        Returns:
            string: user token
        """
        payload = {
            # milliseconds
            "exp": ((dt.datetime.utcnow() + dt.timedelta(days=0, minutes=15)).timestamp() * 1000) // 1,
            "iat": (dt.datetime.utcnow().timestamp() * 1000) // 1,
            "sub": self.user_id,
            "lia": self.status.value,
        }
        token = jwt.encode(payload, current_app.config.get(
            "SECRET_KEY"), algorithm="HS256")
        return token

    @staticmethod
    def decode_auth_token(auth_token):
        """
        Decodes the auth token
        Args:
            str: auth_token
        Returns: Union[integer, string]: userid, or error message.
        """
        try:
            payload = jwt.decode(auth_token, current_app.config.get(
                "SECRET_KEY"), algorithms="HS256")
            return {"user_id": payload["sub"], "status": payload["lia"], "exp": payload["exp"]}
        except jwt.ExpiredSignatureError:
            return "Signature expired. Please log in again."
        except jwt.InvalidTokenError:
            return "Invalid token. Please log in again."

    def encode_reset_token(self, step: int):
        """
        Generates the reset Token
        Returns:
            string: user reset token
        """
        valid = {1, 2}
        if step not in valid:
            raise ValueError("encode_reset_token: step must be 1 or 2.")
        payload = {
            "rst": step,
            # milliseconds
            "exp": ((dt.datetime.utcnow() + dt.timedelta(days=0, minutes=15)).timestamp() * 1000) // 1,
            "iat": (dt.datetime.utcnow().timestamp() * 1000) // 1,
            "sub": self.user_id,
        }
        token = jwt.encode(payload, current_app.config.get(
            "SECRET_KEY"), algorithm="HS256")
        return token

    @staticmethod
    def decode_reset_token(reset_token):
        """
        Decodes the reset token
        Args:
            str: reset_token
        """
        try:
            payload = jwt.decode(reset_token, current_app.config.get(
                "SECRET_KEY"), algorithms="HS256")
            return {"user_id": payload["sub"], "reset_step": payload["rst"], "exp": payload["exp"]}
        except jwt.ExpiredSignatureError:
            return "Signature expired. Please try again."
        except jwt.InvalidTokenError:
            return "Invalid token. Please try again."

    def encode_chat_token(self):
        """
        Generates the Chat Token
        Returns:
            string: user token
        """
        payload = {
            "exp": ((dt.datetime.utcnow() + dt.timedelta(days=0, minutes=180)).timestamp() * 1000) // 1,
            "iat": (dt.datetime.utcnow().timestamp() * 1000) // 1,
            "sub": self.user_id,
            "lia": self.status.value,
            "cht": True
        }
        token = jwt.encode(payload, current_app.config.get(
            "SECRET_KEY"), algorithm="HS256")
        return token

    @staticmethod
    def decode_chat_token(chat_token):
        """
        Decodes the chat token
        Args:
            str: chat_token
        Returns: Union[integer, string]: userid, or error message.
        """
        try:
            payload = jwt.decode(chat_token, current_app.config.get(
                "SECRET_KEY"), algorithms="HS256")
            return {"user_id": payload["sub"], "status": payload["lia"], "exp": payload["exp"], "cht": payload["cht"]}
        except jwt.ExpiredSignatureError:
            return "Signature expired. Please log in again."
        except jwt.InvalidTokenError:
            return "Invalid token. Please log in again."


class Manager(db.Model):

    __tablename__ = "manager"  # table in pmsdb

    manager_id = db.Column(db.INTEGER, primary_key=True)


class Owner(db.Model):
    __tablename__ = "owner"

    owner_id = db.Column(db.INTEGER, primary_key=True)
    manager_id = db.Column(db.INTEGER, nullable=True)


class Tenant(db.Model):
    __tablename__ = "tenant"

    tenant_id = db.Column(db.INTEGER, primary_key=True)
    manager_id = db.Column(db.INTEGER, nullable=True)


class TenantArtifact(db.Model):

    __tablename__ = "tenant_artifact"

    artifact_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.VARCHAR(255), nullable=True, default=None)
    artifact_json = db.Column(MutableDict.as_mutable(JSON))
    artifact_type = db.Column(db.Enum(ArtifactType), nullable=False)
    artifact_date = db.Column(
        db.DateTime, nullable=False, default=dt.date.today())
    status = db.Column(db.Enum(ArtifactStatus), nullable=False,
                       default=ArtifactStatus.pending)
    tenant_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)
    inspection_id = db.Column(db.INTEGER, nullable=True)


class OwnerArtifact(db.Model):

    __tablename__ = "owner_artifact"

    artifact_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.VARCHAR(255), nullable=True, default=None)
    artifact_json = db.Column(MutableDict.as_mutable(JSON))
    artifact_type = db.Column(db.Enum(ArtifactType), nullable=False)
    artifact_date = db.Column(
        db.DateTime, nullable=False, default=dt.date.today())
    status = db.Column(db.Enum(ArtifactStatus), nullable=False,
                       default=ArtifactStatus.pending)
    owner_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)
    inspection_id = db.Column(db.INTEGER, nullable=True)


class ManagerArtifact(db.Model):

    __tablename__ = "manager_artifact"

    artifact_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.VARCHAR(255), nullable=True, default=None)
    artifact_json = db.Column(MutableDict.as_mutable(JSON))
    artifact_type = db.Column(db.Enum(ArtifactType), nullable=False)
    artifact_date = db.Column(
        db.DateTime, nullable=False, default=dt.date.today())
    status = db.Column(db.Enum(ArtifactStatus), nullable=False,
                       default=ArtifactStatus.archived)
    manager_id = db.Column(db.INTEGER, nullable=False)


class Inspection(db.Model):

    __tablename__ = "inspection"

    inspection_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    inspection_date = db.Column(db.DateTime, nullable=False)
    from_time = db.Column(db.TIME, nullable=False, index=True)
    to_time = db.Column(db.TIME, nullable=False)
    status = db.Column(db.Enum(InspectionStatus),
                       nullable=False, default=InspectionStatus.scheduled)
    property_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)
    itinerary_id = db.Column(db.INTEGER, nullable=True)


class Itinerary(db.Model):

    __tablename__ = "itinerary"

    itinerary_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    itinerary_date = db.Column(db.DateTime, nullable=False, index=True)
    route_json = db.Column(MutableDict.as_mutable(JSON))
    manager_id = db.Column(db.INTEGER, nullable=False)


class TenantNotification(db.Model):

    __tablename__ = "tenant_notification"

    notification_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.TIMESTAMP, nullable=False,
                          index=True, default=dt.datetime.now())
    read = db.Column(db.BOOLEAN, nullable=False, default=False)
    sent = db.Column(db.BOOLEAN, nullable=False, default=False)
    tenant_id = db.Column(db.INTEGER, nullable=False)
    artifact_id = db.Column(db.INTEGER, nullable=True)


class ManagerNotification(db.Model):

    __tablename__ = "manager_notification"

    notification_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.TIMESTAMP, nullable=False,
                          index=True, default=dt.datetime.now())
    source = db.Column(db.Enum(SourceType), nullable=False)
    read = db.Column(db.BOOLEAN, nullable=False, default=False)
    sent = db.Column(db.BOOLEAN, nullable=False, default=False)
    manager_id = db.Column(db.INTEGER, nullable=False)
    tenant_artifact_id = db.Column(db.INTEGER, nullable=True)
    owner_artifact_id = db.Column(db.INTEGER, nullable=True)


class OwnerNotification(db.Model):

    __tablename__ = "owner_notification"

    notification_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.TIMESTAMP, nullable=False,
                          index=True, default=dt.datetime.now())
    read = db.Column(db.BOOLEAN, nullable=False, default=False)
    sent = db.Column(db.BOOLEAN, nullable=False, default=False)
    owner_id = db.Column(db.INTEGER, nullable=False)
    artifact_id = db.Column(db.INTEGER, nullable=True)


class TenantRoom(db.Model):

    __tablename__ = "tenant_room"

    room_id = db.Column(db.TEXT, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)


class OwnerRoom(db.Model):

    __tablename__ = "owner_room"

    room_id = db.Column(db.TEXT, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)


class TenantMessage(db.Model):

    __tablename__ = "tenant_message"

    message_id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)
    text = db.Column(db.VARCHAR(5000), nullable=False)
    author_id = db.Column(db.INTEGER, nullable=False)
    author_name = db.Column(db.VARCHAR(255), nullable=False)
    timestamp = db.Column(db.TIMESTAMP, nullable=False,
                          index=True, default=dt.datetime.now())
    room_id = db.Column(db.TEXT, nullable=False)


class OwnerMessage(db.Model):

    __tablename__ = "owner_message"

    message_id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)
    text = db.Column(db.VARCHAR(5000), nullable=False)
    author_id = db.Column(db.INTEGER, nullable=False)
    author_name = db.Column(db.VARCHAR(255), nullable=False)
    timestamp = db.Column(db.TIMESTAMP, nullable=False,
                          index=True, default=dt.datetime.now())
    room_id = db.Column(db.TEXT, nullable=False)


class DefaultTemplate(db.Model):

    __tablename__ = "default_template"

    template_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    template_json = db.Column(MutableDict.as_mutable(JSON))
    title = db.Column(db.VARCHAR(255), nullable=True, default=None)
    description = db.Column(db.VARCHAR(255), nullable=True, default=None)


class CustomTemplate(db.Model):

    __tablename__ = "custom_template"

    template_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    template_json = db.Column(MutableDict.as_mutable(JSON))
    title = db.Column(db.VARCHAR(255), nullable=True, default=None)
    description = db.Column(db.VARCHAR(255), nullable=True, default=None)
    manager_id = db.Column(db.INTEGER, nullable=False)
    template_date = db.Column(db.DateTime, nullable=False)
    parent_template = db.Column(db.INTEGER, nullable=False)


class Notice(db.Model):

    __tablename__ = "notice"

    notice_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    message = db.Column(db.VARCHAR(500), nullable=False)
    recipient_email = db.Column(db.VARCHAR(255), nullable=False)
    tenant = db.Column(db.BOOLEAN, default=False)
    owner = db.Column(db.BOOLEAN, default=False)
    notice_date = db.Column(db.DATE, nullable=False)
    notice_time = db.Column(db.TIME, nullable=False)
    sent = db.Column(db.BOOLEAN, nullable=False, default=False)
    manager_id = db.Column(db.INTEGER, nullable=False)
    contact_id = db.Column(db.INTEGER, nullable=False)


class TokenBlacklist(db.Model):
    """
    Token Model for storing JWT tokens
    """

    __tablename__ = "token_blacklist"

    token_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(168), unique=True, nullable=False, index=True)
    blacklist_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, token):
        self.token = token
        self.blacklist_date = dt.datetime.now()

    def __repr__(self):
        return "<token_id: token: {}".format(self.token)

    @staticmethod
    def check_blacklist(auth_token):
        # check whether auth token has been blacklisted
        res = TokenBlacklist.query.filter_by(token=str(auth_token)).first()
        if res:
            return True
        else:
            return False


class ResetTokenBlacklist(db.Model):
    """
    Reset Token Model for storing JWT tokens
    """

    __tablename__ = "reset_token_blacklist"

    token_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(168), unique=True, nullable=False, index=True)
    blacklist_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, token):
        self.token = token
        self.blacklist_date = dt.datetime.now()

    def __repr__(self):
        return "<token_id: token: {}".format(self.token)

    @staticmethod
    def check_blacklist(reset_token):
        # check whether reset token has been blacklisted
        res = ResetTokenBlacklist.query.filter_by(
            token=str(reset_token)).first()
        if res:
            return True
        else:
            return False


class ChatTokenBlacklist(db.Model):
    """
    for storing blacklisted chat tokens
    """

    __tablename__ = "chat_token_blacklist"

    token_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(197), unique=True, nullable=False, index=True)
    blacklist_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, token):
        self.token = token
        self.blacklist_date = dt.datetime.now()

    def __repr__(self):
        return "<token_id: token: {}".format(self.token)

    @staticmethod
    def check_blacklist(chat_token):
        # check whether chat token has been blacklisted
        res = ChatTokenBlacklist.query.filter_by(
            token=str(chat_token)).first()
        if res:
            return True
        else:
            return False


class Contact(db.Model):

    __tablename__ = "contact"  # table in pmsdb

    contact_id = db.Column(db.INTEGER, primary_key=True)
    preferred_name = db.Column(db.VARCHAR(255), nullable=False)
    phone_number = db.Column(db.CHAR(10), nullable=True)
    email = db.Column(db.VARCHAR(255), nullable=True)
    tenant = db.Column(db.BOOLEAN, default=False, nullable=False)
    owner = db.Column(db.BOOLEAN, default=False, nullable=False)
    connected = db.Column(db.BOOLEAN, default=False, nullable=False)
    user_id = db.Column(db.INTEGER, nullable=False)
    manager_id = db.Column(db.INTEGER, nullable=False)


class Property(db.Model):
    __tablename__ = "property"  # table in pmsdb

    property_id = db.Column(db.INTEGER, primary_key=True)
    address = db.Column(db.VARCHAR(255))
    post_code = db.Column(db.Numeric(4, 0))
    map_lat = db.Column(db.Numeric(18, 16))
    map_long = db.Column(db.Numeric(18, 15))
    leased = db.Column(db.BOOLEAN, default=False)
    manager_id = db.Column(db.INTEGER, nullable=True)
    owner_id = db.Column(db.INTEGER)
    tenant_id = db.Column(db.INTEGER)
    lease_expiration_date = db.Column(db.DateTime, nullable=True)


class ManagerPropertySettings(db.Model):
    __tablename__ = "manager_property_settings"  # table in pmsdb

    property_id = db.Column(db.INTEGER, primary_key=True)
    img_dir = db.Column(db.VARCHAR(255), nullable=False)
    manager_id = db.Column(db.INTEGER)


class OwnerPropertySettings(db.Model):
    __tablename__ = "owner_property_settings"  # table in pmsdb

    property_id = db.Column(db.INTEGER, primary_key=True)
    img_dir = db.Column(db.VARCHAR(255), nullable=False)
    owner_id = db.Column(db.INTEGER)
