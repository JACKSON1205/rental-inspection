import datetime as dt
from functools import wraps
from flask import Response, current_app, json, request
from flask_mail import Message

from .. import db, mail
from ..constants import RESPONSE_STATUS, UserStatus, ArtifactType
from ..models import AbstractUser, ChatTokenBlacklist, ManagerNotification, OwnerNotification, Property, ResetTokenBlacklist, TenantNotification, TokenBlacklist, Notice, TenantArtifact, OwnerArtifact, TenantMessage, OwnerMessage


def send_notices():
    today = dt.datetime.today().date()
    now = dt.datetime.now().time()
    with db.app.app_context():
        notices = Notice.query.filter(
            Notice.notice_date == today, Notice.notice_time <= now, Notice.sent == False)
        users = AbstractUser.query.filter(AbstractUser.email.in_(
            list(set([n.recipient_email for n in notices])))).all()
        users = {u.email: u for u in users}

        for notice in notices:
            if (notice.recipient_email not in users):
                db.session.delete(notice)
                continue
            user = users[notice.recipient_email]
            if (notice.tenant and not user.tenant) or (notice.owner and not user.owner):
                db.session.delete(notice)
                continue
            if notice.tenant:
                artifact = TenantArtifact()
                artifact.tenant_id = user.user_id
            elif notice.owner:
                artifact = OwnerArtifact()
                artifact.owner_id = user.user_id
            else:
                return
            artifact.artifact_json = {"message": notice.message}
            artifact.artifact_type = ArtifactType.notice.value
            notice.sent = True
            db.session.add(artifact)
        db.session.commit()


def save_message(data):
    with db.app.app_context():
        room_id = data['room_id']
        if room_id[0] == "t":
            message = TenantMessage(
                text=data['message'],
                room_id=data['room_id'],
                author_id=data['author_id'],
                author_name=data['author_name'],
            )
        else:
            message = OwnerMessage(
                text=data['message'],
                room_id=data['room_id'],
                author_id=data['author_id'],
                author_name=data['author_name'],
            )
        db.session.add(message)
        db.session.commit()


def send_emails():
    with db.app.app_context():
        t_notif = TenantNotification.query\
            .filter(TenantNotification.sent == False)\
            .join(AbstractUser, AbstractUser.user_id == TenantNotification.tenant_id)\
            .add_columns(TenantNotification.text.label("text"), AbstractUser.email.label("email"))\
            .all()
        for n in t_notif:
            n.TenantNotification.sent = True
        t_notif = [{"email": row.email, "text": row.text} for row in t_notif]

        m_notif = ManagerNotification.query\
            .filter(ManagerNotification.sent == False)\
            .join(AbstractUser, AbstractUser.user_id == ManagerNotification.manager_id)\
            .add_columns(ManagerNotification.text.label("text"), AbstractUser.email.label("email"))\
            .all()
        for n in m_notif:
            n.ManagerNotification.sent = True
        m_notif = [{"email": row.email, "text": row.text} for row in m_notif]

        o_notif = OwnerNotification.query\
            .filter(OwnerNotification.sent == False)\
            .join(AbstractUser, AbstractUser.user_id == OwnerNotification.owner_id)\
            .add_columns(OwnerNotification.text.label("text"), AbstractUser.email.label("email"))\
            .all()
        for n in o_notif:
            n.OwnerNotification.sent = True
        db.session.commit()
        o_notif = [{"email": row.email, "text": row.text} for row in o_notif]

        notifications = [*t_notif, *m_notif, *o_notif]
        current_app.logger.info(f"NOTIFICATIONS\n {notifications}")

        # msg = Message('TEST', sender='homemate@outlook.com.au',
        #               recipients=['samer28.haddad@yahoo.com'])
        # msg.body = "TEST"
        # mail.send(msg)
        # with mail.app.app_context():
        for notif in notifications:
            msg = Message(notif["text"], sender='homemate.bigai@gmail.com',
                          recipients=[notif["email"]])  # notif["email"]
            msg.body = notif["text"]
            mail.send(msg)


def update_lease():
    today = dt.datetime.today().date()
    with db.app.app_context():
        props = Property.query.filter(
            Property.lease_expiration_date < today, Property.leased == True)
        for prop in props:
            prop.lease_expiration_date = None
            prop.leased = False
            prop.tenant_id = None
        db.session.commit()


def next_hour(now):
    return (now.replace(second=0, microsecond=0, minute=0, hour=now.hour+1))


def loadJSON(obj):
    if isinstance(obj, dict):
        return obj
    elif isinstance(obj, str):
        obj_str = obj.replace("{", "").replace("}", "")
        obj_dict = {i.split(":")[0]: i.split(":")[1]
                    for i in obj_str.split(",")}
        return obj_dict
    else:
        return None


def invalid_token(token):
    return isinstance(token, str)


def expired_token(payload):
    return dt.datetime.utcnow().timestamp() * 1000 >= payload["exp"]


def set_offline(payload):
    user = AbstractUser.query.filter_by(user_id=payload["user_id"]).first()
    user.status = UserStatus.offline
    db.session.commit()
    return


def _optional_arg_decorator(fn):
    """allows creation of decorators with optional args.
    Args:
        fn (function)
    """

    def wrapped_decorator(*args, **kwargs):
        if len(args) == 1 and callable(args[0]):
            return fn(args[0])

        else:

            def real_decorator(decoratee):
                return fn(decoratee, *args, **kwargs)

            return real_decorator

    return wrapped_decorator


def _update_response(response: Response, token: str):
    """Update a response with the new token. Either replace or create the field in the data.
    Args:
        response (Response):
        token (str):
    """
    data = json.loads(response.data)
    response.data = json.dumps({**data, **{"token": token}})
    return response


@_optional_arg_decorator
def auth_required(
    func,
    *,
    check_token=True,
    gen_token=True,
    gen_token_on_error=True,
    check_user_status=True,
    reset=False,
    chat=False,
    reset_val=0,
    access_right=["all"],
):
    @wraps(func)
    def decorated_function(*args, **kws):
        # grab authorization field from request headers
        payload = dict()
        if check_token:
            try:
                auth_headers = request.headers.get("Authorization", "").split()
            except:
                current_app.logger.error(
                    "Authorization header not found. "
                    "Are you sure you should be using the auth_required wrapper? "
                    "Perhaps you should set check_token=False."
                )
                return Response(
                    json.dumps(
                        {
                            "error": "::ERROR:: Authorization header not found. "
                            "Are you sure you should be using the auth_required wrapper? "
                            "Perhaps you should set check_token=False."
                        }
                    ),
                    status=RESPONSE_STATUS["INTERNAL"],
                    mimetype="application/json",
                )

            # check format
            if len(auth_headers) != 2:
                return Response(
                    json.dumps(
                        {"error": "::ERROR:: You may be missing a 'Bearer' in your javascript."}),
                    status=RESPONSE_STATUS["INTERNAL"],
                    mimetype="application/json",
                )

            # extract token; check if blacklisted
            auth_token = auth_headers[1]
            current_app.logger.info(f"Received token {auth_token}")
            if reset:
                payload = AbstractUser.decode_reset_token(auth_token)
                if ResetTokenBlacklist.check_blacklist(auth_token):
                    current_app.logger.error(f"Blacklisted! {auth_token}")
                    set_offline(payload)
                    return Response(
                        json.dumps(
                            {"error": "Invalid token (blacklisted): Please sign in again."}),
                        status=RESPONSE_STATUS["UNAUTHORIZED"],
                        mimetype="application/json",
                    )
                else:
                    # blacklist it
                    current_app.logger.info(f"Blacklisting {auth_token}")
                    blacklisted = ResetTokenBlacklist(token=auth_token)
                    db.session.add(blacklisted)
                    db.session.commit()

            else:
                try:
                    payload = AbstractUser.decode_chat_token(auth_token)
                    if ChatTokenBlacklist.check_blacklist(auth_token):
                        current_app.logger.error(f"Blacklisted! {auth_token}")
                        set_offline(payload)
                        return Response(
                            json.dumps(
                                {"error": "Invalid token (blacklisted): Please sign in again."}),
                            status=RESPONSE_STATUS["UNAUTHORIZED"],
                            mimetype="application/json",
                        )
                    else:
                        # blacklist it
                        current_app.logger.info(f"Blacklisting {auth_token}")
                        blacklisted = ChatTokenBlacklist(token=auth_token)
                        db.session.add(blacklisted)
                        db.session.commit()
                except:
                    payload = AbstractUser.decode_auth_token(auth_token)
                    if TokenBlacklist.check_blacklist(auth_token):
                        current_app.logger.error("Blacklisted!")
                        set_offline(payload)
                        return Response(
                            json.dumps(
                                {"error": "Invalid token (blacklisted): Please sign in again."}),
                            status=RESPONSE_STATUS["UNAUTHORIZED"],
                            mimetype="application/json",
                        )
                    else:
                        # blacklist it
                        current_app.logger.info(f"Blacklisting {auth_token}")
                        blacklisted = TokenBlacklist(token=auth_token)
                        db.session.add(blacklisted)
                        db.session.commit()

            if invalid_token(payload):
                current_app.logger.error(f"Invalid Token: {payload}")
                set_offline(payload)
                return Response(
                    json.dumps({"error": payload}),
                    status=RESPONSE_STATUS["UNAUTHORIZED"],
                    mimetype="application/json",
                )
            if expired_token(payload):
                current_app.logger.error(f"Expired: {payload}")
                set_offline(payload)
                return Response(
                    json.dumps(
                        {"error": "Expired Session, please log in again."}),
                    status=RESPONSE_STATUS["UNAUTHORIZED"],
                    mimetype="application/json",
                )
            # if reset, check correct step
            if reset and payload.get("reset_step") != reset_val - 1:
                # reset token for wrong stage
                current_app.logger.error(f"Reset token for incorrect stage.")
                set_offline(payload)
                return Response(
                    json.dumps(
                        {"error": "Invalid token, please restart process."}),
                    status=RESPONSE_STATUS["UNAUTHORIZED"],
                    mimetype="application/json",
                )
            # check user status
            if check_user_status:
                user = AbstractUser.query.filter_by(
                    user_id=payload["user_id"]).first()

                # in case user is not in database, otherwise it will check for status in NonType object
                if not user:
                    current_app.logger.error(f"User not found.")
                    return Response(
                        json.dumps({"error": "User not found."}),
                        status=RESPONSE_STATUS["UNAUTHORIZED"],
                        mimetype="application/json",
                    )

                if user.status == UserStatus.offline:
                    current_app.logger.error(f"User is not logged in.")
                    return Response(
                        json.dumps({"error": "You are not logged in."}),
                        status=RESPONSE_STATUS["UNAUTHORIZED"],
                        mimetype="application/json",
                    )

                # added access rights, defaule="all" means all roles can call the requested method
                if (not any(i in access_right for i in ["tenant", "all"]) and user.status == UserStatus.online_tenant)\
                        or (not any(i in access_right for i in ["manager", "all"]) and user.status == UserStatus.online_manager)\
                        or (not any(i in access_right for i in ["owner", "all"]) and user.status == UserStatus.online_owner):
                    current_app.logger.error(
                        f"User does not have access rights for this method.")

                    return Response(
                        json.dumps(
                            {"error": "You can't use this feature.", "token": user.encode_auth_token()}),
                        status=RESPONSE_STATUS["METHOD_NOT_ALLOWED"],
                        mimetype="application/json",
                    )

        # call function
        try:
            response = func(*args, **kws, token_payload=payload)
        except Exception as e:
            response = Response(
                json.dumps(
                    {"error": "::ERROR:: Internal error occurred: " + str(e)}),
                status=RESPONSE_STATUS["INTERNAL"],
                mimetype="application/json",
            )
        if response.status_code == RESPONSE_STATUS["UNAUTHORIZED"]:
            # unauthorized: user directed to logout, and so no new token needed
            set_offline(payload)
            return response

        if gen_token:
            # create new token with new expiry
            user_id = payload.get(
                "user_id") or response.get_json().get("user_id")
            if user_id is None:
                if gen_token_on_error or response.status_code == RESPONSE_STATUS["OK"]:
                    return Response(
                        json.dumps(
                            {
                                "error": "::ERROR:: Cannot access user_id from either payload or response. "
                                "Did you provide one?"
                            }
                        ),
                        status=RESPONSE_STATUS["INTERNAL"],
                        mimetype="application/json",
                    )
                else:
                    return response
            user = AbstractUser.query.filter_by(user_id=user_id).first()
            new_token = (
                user.encode_reset_token(reset_val) if reset and response.status_code == RESPONSE_STATUS["OK"]
                else (user.encode_reset_token(reset_val - 1) if reset
                      else (user.encode_chat_token()) if chat
                      else (user.encode_auth_token()))
            )
            current_app.logger.info(f"Sending token {new_token}")
            return _update_response(response, new_token)

        return response

    return decorated_function
