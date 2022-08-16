import React, { useEffect, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import PropTypes from 'prop-types';

function getFormattedTime () {
  const months = { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' };
  const date = new Date(Date.now());
  const month = date.getUTCMonth() + 1;
  const day = date.getDate();
  let hours = date.getHours();
  const clock = (hours <= 12) ? 'AM' : 'PM';
  hours = hours > 12 ? hours - 12 : hours;
  const minutes = date.getMinutes();
  const hoursPad = (hours < 10) ? '0' : '';
  const minutesPad = (minutes < 10) ? '0' : '';
  const time = hoursPad + hours + ':' + minutesPad + minutes + ' ' + clock + ' ' + day + ' ' + months[month];
  return time;
}
// time:
//           new Date(Date.now()).getHours() +
//           ':' +
//           new Date(Date.now()).getMinutes(),
function Chat (props) {
  const socket = props.socket;
  const userID = props.userID;
  const roomID = props.roomID;
  const userName = props.userName;
  const [history] = [props.history];
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState(history);
  // const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== '') {
      const time = getFormattedTime();
      console.log(time);
      const messageData = {
        room_id: roomID,
        author_id: userID,
        author_name: userName,
        message: currentMessage,
        time: time,
      };

      await socket.emit('send_message', messageData);
      // setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className='chat-window'>
      <div className='chat-header'>
        <p>Live Chat</p>
      </div>
      <div className='chat-body'>
        <ScrollToBottom className='message-container'>
          {messageList.map((messageContent, key) => {
            return (
              <div className='message' key={key} id={userID === messageContent.author_id ? 'you' : 'other'}>
                <div>
                  <div className='message-content'>
                    <p>{messageContent.message}</p>
                  </div>
                  <div className='message-meta'>
                    <p id='time'>{messageContent.time}</p>
                    <p id='author'>{messageContent.author_name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className='chat-footer'>
        <input
          type='text'
          value={currentMessage}
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === 'Enter' && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

Chat.propTypes = {
  socket: PropTypes.object.isRequired,
  userID: PropTypes.number.isRequired,
  roomID: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  history: PropTypes.array.isRequired,
}

export default Chat;
