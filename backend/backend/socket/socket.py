from flask_socketio import send, emit, join_room, leave_room
from flask import current_app

from .. import db
from models import TenantMessage, OwnerMessage

socketio = current_app.config["socket"]


@socketio.on('connection')
def test_connect():
    emit('after connect',  {'data': 'Lets dance'})


@socketio.on('join')
def on_join(data):
    user_id = data['user_id']
    room_id = data['room_id']
    user_name = data['user_name']
    join_room(room_id)
    send(user_name + ' is online.', to=room_id)


@socketio.on('leave')
def on_leave(data):
    user_id = data['user_id']
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
