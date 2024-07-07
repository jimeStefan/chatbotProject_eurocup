import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import eurocupLogo from './eurocup-logo.png';
import netherlands from './images/netherlands.png';
import englandvictory from './images/englandvictory.png';
import everyplayer from './images/everyplayer.png';
import pepe from './images/pepe.png';

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
      <header className="header">
        <nav className="nav">
          <div className="containerr">
            <div className="nav__wrapper">
              <div className="logo"></div>
              <div className="navigation">
                <ul className="nav__menu">
                  <li className="nav__item"><a href="#home" className="nav__link">Home</a></li>
                  <li className="nav__item"><a href="#menu" className="nav__link">Highlights</a></li>
                  <li className="nav__item"><a href="#about" className="nav__link">Newsletter</a></li>
                  <li className="nav__item"><a href="#blog" className="nav__link">Blog</a></li>
                </ul>
              </div>
              <span className="mobile__menu"><i className="ri-menu-line"></i></span>
            </div>
          </div>
        </nav>
      </header>

      <div className="main-container">
        <div className="sidebar">
          <h2>Headlines</h2>
          <ul>
            <li className='headline-item'><a href="#photos"><h6>Netherlands 2-1 Türkiye: Oranje stage comeback to set up England semi-final</h6></a>
              <div id="photos">
                <img src={netherlands} alt="Netherlands vs Türkiye" style={{ width: "100%", borderRadius: "5px", marginTop: "15px" }} />
              </div>
            </li>
            <li className='headline-item'><a href="#photos"><h6>Every EURO 2024 Player of the Match</h6></a>
              <div id="photos">
                <img src={everyplayer} alt="Every EURO 2024 Player of the Match" style={{ width: "100%", borderRadius: "5px", marginTop: "10px" }} />
              </div>
            </li>
            <li className='headline-item'><a href="#photos"><h6>Report: Spot-on England through</h6></a>
              <div id="photos">
                <img src={englandvictory} alt="Report: Spot-on England through" style={{ width: "100%", borderRadius: "5px", marginTop: "10px" }} />
              </div>
            </li>
            <li className='headline-item'><a href="#photos"><h6>Pepe extends record as oldest player to appear at a EURO</h6></a>
              <div id="photos">
                <img src={pepe} alt="Pepe extends record as oldest player to appear at a EURO" style={{ width: "100%", borderRadius: "5px", marginTop: "10px" }} />
              </div>
            </li>
          </ul>
        </div>

        <div className="container">
          <div className="logo-container">
            <img src={eurocupLogo} alt="Eurocup Logo" className="logo" />
          </div>
          <h1 className="my-4 d-flex align-items-center justify-content-center">EUROCUP2024 <span className="highlightt">CHATBOT</span></h1>
          <div className="chatbox border rounded p-3 mb-4" ref={chatboxRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.user ? 'user' : ''}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
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

      <section className="section" id="menu">
        <div className="container">
          <div className="menu__section-top">
            <h2>Highlights Videos</h2>
          </div>
          <div className="menu__wrapper">
            <div className="menu__item">
              <div className="menu__img">
                <iframe 
                  src="https://www.youtube.com/embed/k2qiPNo5mTo?si=u9pcrs3FqCeMVlUd" 
                  title="Video 1" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
            <div className="menu__item">
              <div className="menu__img">
                <iframe 
                  src="https://www.youtube.com/embed/VIDEO_ID_2" 
                  title="Video 2" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
            <div className="menu__item">
              <div className="menu__img">
                <iframe 
                  src="https://www.youtube.com/embed/VIDEO_ID_3" 
                  title="Video 3" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="section footer">
        <div className="containerfooter">
          <div className="footer__wrapper">
            <div className="footer__logo">
              <div className="logo">
                <h3>EUROCUP2024<span className="highlight">CHATBOT</span></h3>
              </div>
              <p>NEWSLETTER</p>
              <div className="subscribe__box">
                <input type="email" placeholder="Your email" />
                <button className="subscribe__btn">Subscribe</button>
              </div>
            </div>

            <div className="footer__box">
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <a href="#about" className="footer__link">Newsletter</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Highlights</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Stats</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Teams</a>
                </li>
              </ul>
            </div>

            <div className="footer__box">
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <a href="#about" className="footer__link">Stats</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Teams</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Highlights</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Newsletter</a>
                </li>
              </ul>
            </div>

            <div className="footer__box">
              <ul className="footer__menu">
                <li className="footer__menu-item">
                  <a href="#about" className="footer__link">Teams</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Stats</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Newsletter</a>
                </li>
                <li className="footer__menu-item">
                  <a href="#" className="footer__link">Highlights</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
