import './Join.css';
import io from 'socket.io-client';
import React from 'react';
import Chat from './Chat';

const socket = io('http://localhost:5005', {
  withCredentials: true,
  extraHeaders: {
    customHeader: 'abcd'
  },
  cors: { origin: 'http://localhost' },
});

const PORT = require('./config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

async function Join (clientID, role) {
  let options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
    }),
  }
  if (clientID !== 0) {
    options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      body: JSON.stringify({
        client_id: clientID,
        role: role,
      }),
    }
  }

  const res = await fetch(url + '/admin/chat', options);
  const data = await res.json();

  if (res.status === 200 || res.status === 201) {
    console.log('User Joined Chat');
    sessionStorage.setItem('token', data.token);
    const userID = data.user_id
    const roomID = data.room_id
    const userName = data.user_name
    const [history] = [data.history]
    const room = { user_id: userID, room_id: roomID, user_name: userName }
    await socket.emit('join', room);

    // className='App'
    let key = new Date();
    key = key.getTime();
    return (
      <div>
        <Chat socket={socket} userID={userID} roomID={roomID} userName={userName} history={history} key={key} />
      </div>
    );
  } else {
    console.log(data.error);
    alert(data.error);
  }
  sessionStorage.setItem('token', data.token);
}

export default Join;
