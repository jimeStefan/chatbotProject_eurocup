import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, { text: message, user: false }]);
    });

    socket.emit('message', 'Hello, how can I help?');

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = (msg) => {
    const message = msg || input;
    if (message.trim()) {
      socket.emit('message', message);
      setMessages((prevMessages) => [...prevMessages, { text: message, user: true }]);
      setInput('');
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">Eurocup Chatbot</h1>
      <div className="chatbox border rounded p-3 mb-4">
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
        <button className="btn btn-primary" onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
}

export default App;
