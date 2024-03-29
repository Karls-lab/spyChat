// App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; 
import { encryptMessage, decryptMessage } from './encryption.jsx';
import { Toaster } from 'react-hot-toast';
import { notify} from './toast.jsx';

// Declare Server Socket
const socket = io('http://localhost:3001', { path : '/socket.io'});

function App() {
  const [textInputValue, setTextInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [encryptKey, setEncryptKey] = useState('');
  const mainDisplayRef = React.useRef(null);

  // Main useEffect, set up userID and handle incoming messages
  useEffect(() => {
    // Start of the Program
    // Retrieve user ID from sessionStorage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Generate a unique user ID if not found in sessionStorage
      const userID = "user-" + uuidv4();
      setUserId(userID);
      sessionStorage.setItem('userId', userID); // Save user ID to sessionStorage
    }
    
    // Retrieve stored messages from localStorage on component mount
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    // Handle incoming messages
    socket.on('message', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      // Store messages in local storage
      localStorage.setItem('messages', JSON.stringify([...messages, message]));
    });

    // Notify on connection status
    socket.on('connect', () => {
      console.log('Connected!');
      notify('Connected to server', 'success');
      notify('Click on a message to decrypt', 'info')
    });
    socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      notify('Connection error', 'info');
      setTimeout(() => {
      }, 3000);
    });

    return () => {
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

  // Decrypt message
  const handleDecrypt= () => {
    // for message in messages, decrypt message
    let decryptedMessages = [];
    messages.forEach(message => {
      let decryptedMessage = decryptMessage(message.text, encryptKey);
      if (decryptedMessage !== '') {
        notify('Decrypted messages', 'success');
        decryptedMessages.push({id: message.id, text: decryptedMessage, userID: message.userID});
      } else {
        decryptedMessages.push({id: message.id, text: message.text, userID: message.userID});
      }
      console.log('decrypted message:', decryptedMessages);
      setMessages(decryptedMessages) 
    });
  };


  // Encrypt message
  const handleEncrypt = () => {
    if (!textInputValue) return;
    let encryptedMessage = encryptMessage(textInputValue, encryptKey);
    setTextInputValue(encryptedMessage);
    console.log('encrypted message:', encryptedMessage);
  }
 

  // Handle submit button click
  const handleSubmitClick = () => {
    if (!textInputValue) return;
    const newMessage = { id: uuidv4(), text: textInputValue, userID: userId};
    console.log('message:', newMessage)
    socket.emit('message', newMessage);
    setTextInputValue('');
  };


  // Handle Message Click
  const handleMessageClick = (message) => {
    if (message === '') return;
    if (encryptKey === '') {
      notify('Enter in secret phrase', 'info');
      return;
    }
    let decryptedMessages = [];
    let decryptedMessage = decryptMessage(message.text, encryptKey);
    console.log('decrypted message:', decryptedMessage);
    if (decryptedMessage === '') {
      console.log('Failed to decrypt message');
      notify('Failed to decrypt message', 'error');
    } else {
      console.log('Decrypted message:', decryptedMessage)
      notify('Decrypted message', 'success');
      messages.forEach(iterMessage => {
        console.log('iterMessage:', iterMessage);
        if (iterMessage.id === message.id) {
          console.log('message ID:', message.id)
          console.log('The message you clicked on:', iterMessage.text, 
                      ' message id:', iterMessage.id);
          iterMessage.text = decryptedMessage;
          iterMessage.userID = message.userID;
        }
        decryptedMessages.push({id: iterMessage.id, text: iterMessage.text, userID: iterMessage.userID});
      });
      setMessages(decryptedMessages);
    }
  };

  // Main html view
  return (
    <>

    {/* Main Container and Buttons */}
    <div className='mainContainer'>
      {/* Toast component */}
      <Toaster /> 
      {/* MAIN DISPLAY Component */}
      <div id="main-display" className="flexItem" ref={mainDisplayRef}>
        {/* Handle MESSAGES */}
        {messages.map(message => (
          <div key={message.id} 
            className={`message ${message.userID === userId ? 'userMessage' : 'otherUserMessage'}`}
            onClick = {() => handleMessageClick(message)}>
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
