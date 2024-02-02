// App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; 
import { encryptMessage, decryptMessage } from './encryption.jsx';
import e from 'cors';

const socket = io('http://localhost:3001', { path : '/socket.io'});

function App() {
  const [textInputValue, setTextInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [encryptKey, setEncryptKey] = useState('');
  const mainDisplayRef = React.useRef(null);

  // Main useEffect, set up userID and handle incoming messages
  useEffect(() => {
    // Generate a unique user ID on session mount 
    const userID = "user-" + uuidv4();
    setUserId(userID);
    console.log('userID set to:', userID);

    // Handle incoming messages
    socket.on('message', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    socket.on('connect', () => {
      console.log('Connected!');
    });
    return () => {
      // Clean up the subscription
      socket.off('message');
    };
  }, []);

  // When messages change, scroll to bottom of page
  useEffect(() => {
    if (mainDisplayRef.current) {
      console.log("scroll top: ", mainDisplayRef.current.scrollTop);
      mainDisplayRef.current.scrollTop = mainDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  // Encryption and Decryption Logic
  const handleDecrypt= () => {
    // for message in messages, decrypt message
    let decryptedMessages = [];
    messages.forEach(message => {
      let decryptedMessage = decryptMessage(message.text, encryptKey);
      if (decryptedMessage !== '') {
        decryptedMessages.push({id: message.id, text: decryptedMessage, userID: message.userID});
      } else {
        decryptedMessages.push({id: message.id, text: message.text, userID: message.userID});
      }
      console.log('decrypted message:', decryptedMessages);
      setMessages(decryptedMessages) 
    });
  };

  const handleEncrypt = () => {
    let encryptedMessage = encryptMessage(textInputValue, encryptKey);
    setTextInputValue(encryptedMessage);
    console.log('encrypted message:', encryptedMessage);
  }
 
  const handleSubmitClick = () => {
    // Handle submit button click
    const newMessage = { id: uuidv4(), text: textInputValue, userID: userId};
    console.log('message:', newMessage)
    socket.emit('message', newMessage);
    setTextInputValue('');
  };

  return (
    <>

    {/* Main Container and Buttons */}
    <div className='mainContainer'>
      {/* MAIN DISPLAY Component */}
      <div id="main-display" className="flexItem" ref={mainDisplayRef}>
        {/* <div className="" */}
        {messages.map(message => (
          <div key={message.id} 
            className={`message ${message.userID === userId ? 'userMessage' : 'otherUserMessage'}`}>
            {message.text}
          </div>
        ))}
      </div>

      {/* Toolbar, encryption and decryption fields */}
      <div id="toolbar" className="flexItem">
        <div className="flexItem toolbarItem">
          <div className="flexItem division">
            <textarea 
              type="text"
              className="flexItem keyInput"
              value={encryptKey}
              onChange={(e) => setEncryptKey(e.target.value)}
              placeholder="Enter Secret Key">
            </textarea>
          </div>
          <div className="flexItem division">
            <button onClick={handleEncrypt} className="flexItem button smallButton">
              Encrypt Message
            </button>
            <button onClick={handleDecrypt} className="flexItem button smallButton">
              Decrypt Messages
            </button>
          </div>
        </div>
     </div>

      {/* Main Text Input*/}
      <div id="input-menu" className="flexItem">
        <textarea
          type="text"
          id="text-input"
          className="flexItem"
          value={textInputValue}
          placeholder='Enter message here...'
          onChange={(e) => setTextInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitClick();
            }
          }}
        />

        {/* Button Submit */}
        <button 
          onClick={handleSubmitClick} 
          className="flexItem"
          id="submit-button"
          >
          Submit
        </button>
      </div>

    </div>
    </>
  );
}

export default App;
