import datetime as dt
import os
from typing import Any
from flask_apscheduler import APScheduler
import wtforms_json
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_mail import Mail, Message


db = SQLAlchemy()
wtforms_json.init()
scheduler = APScheduler()
socketio = SocketIO(cors_allowed_origins="*")
mail = Mail()
#{'apscheduler.job_defaults.max_instances': '20'}


def create_app() -> Flask:
    """
    create a Flask app for backend communication.
    Returns:
        Flask: app
    """

    # creating directories for property images
    from .constants import (PROPERTY_IMG_BASE_DIR, PROPERTY_IMG_ORIGINAL_PATH,
                            PROPERTY_IMG_THUMBNAIL_PATH)

    os.makedirs(PROPERTY_IMG_BASE_DIR +
                PROPERTY_IMG_ORIGINAL_PATH, exist_ok=True)
    os.makedirs(PROPERTY_IMG_BASE_DIR +
                PROPERTY_IMG_THUMBNAIL_PATH, exist_ok=True)

    from .config import Config
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config())
    #app.config["socket"] = socketio
    db.init_app(app)
    db.app = app
    scheduler.init_app(app)
    scheduler.start()
    socketio.init_app(app)
    mail.init_app(app)
    mail.app = app
    # msg = Message('Hello from the other side!', sender='homemate@outlook.com.au',
    #               recipients=['z5245663@ad.unsw.edu.au'])
    # msg.body = "Hey Sam, sending you this email from my Flask app, lmk if it works"
    # mail.send(msg)

    from .models import TenantMessage, OwnerMessage

    @socketio.on('connection')
    def test_connect():
        emit('after connect',  {'data': 'Lets dance'})

    @socketio.on('join')
    def on_join(data):
        room_id = data['room_id']
        user_name = data['user_name']
        join_room(room_id)
        send(user_name + ' is online.', to=room_id)

    @socketio.on('leave')
    def on_leave(data):
        room_id = data['room_id']
        user_name = data['user_name']
        leave_room(room_id)
        send(user_name + ' has left.', to=room_id)

    @socketio.on('send_message')
    def on_send(data):
        room_id = data['room_id']
        with db.app.app_context():
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
        emit('receive_message', data, room=room_id)

    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint

    app.register_blueprint(auth_blueprint)

    # blueprint for account routes in our app
    from .reset import reset as reset_blueprint

    app.register_blueprint(reset_blueprint)

    # blueprint for account routes in our app
    from .account import api as account_blueprint

    app.register_blueprint(account_blueprint)

    # blueprint for notification route in our app
    from .notification import notification as notification_blueprint

    app.register_blueprint(notification_blueprint)

    # new blueprint for contact route in our app
    from .contact import contact as contact_blueprint

    app.register_blueprint(contact_blueprint)

    # blueprint for inspection route in our app
    from .inspection import inspection as inspection_blueprint

    app.register_blueprint(inspection_blueprint)

    from .archive import archive as archive_blueprint

    app.register_blueprint(archive_blueprint)

    from .artifact import artifact as artifact_blueprint

    app.register_blueprint(artifact_blueprint)

    from .report import report as report_blueprint

    app.register_blueprint(report_blueprint)

    from .notice import notice as notice_blueprint

    app.register_blueprint(notice_blueprint)

    from .requests import requests as requests_blueprint

    app.register_blueprint(requests_blueprint)

    from .property import property_api as property_blueprint

    app.register_blueprint(property_blueprint)

    from .itineraries import itinerary as itinarary_blueprint

    app.register_blueprint(itinarary_blueprint)

    from .template import template as template_blueprint

    app.register_blueprint(template_blueprint)

    from .single_inspection import single_inspection as single_inspection_blueprint

    app.register_blueprint(single_inspection_blueprint)

    from .chat import chat as chat_blueprint

    app.register_blueprint(chat_blueprint)

    return app
