import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import eurocupLogo from './eurocup-logo.png';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatboxRef = useRef(null); // Ref to the chatbox element

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, { text: message, user: false }]);
    });

    socket.emit('message', 'Hello, how can I help?');

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chatbox when messages change
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (msg) => {
    const message = msg || input;
    if (message.trim()) {
      socket.emit('message', message);
      setMessages((prevMessages) => [...prevMessages, { text: message, user: true }]);
      setInput('');
    }
  };

  return (
    <div className="body">
      <div className="container">
        <div className="logo-container">
          <img src={eurocupLogo} alt="Eurocup Logo" className="logo" />
        </div>
        <h1 className="my-4">EuroCup2024 Chatbot</h1>
        <div className="chatbox border rounded p-3 mb-4" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.user ? 'user' : ''}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary" onClick={() => sendMessage()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
