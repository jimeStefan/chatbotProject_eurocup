# chatbotProject_eurocup


This project is a real-time chatbot application that provides information about the Eurocup 2024. Users can interact with the chatbot to get details about teams, players, and matches.

## Installation

### Clone the Repository

```bash
git clone [https://github.com/yourusername/chatbot_eurocup.git](https://github.com/jimech/chatbotProject_eurocup.git)
cd chatbot-project-eurocup

2. Install dependencies (Backend Dependencies):
cd backend
npm init -y
npm install express http socket.io axios mongoose cors date-fns

Install dependencies (front end)
cd frontend
npm init -y
npm install react react-dom socket.io-client vite @vitejs/plugin-react bootstrap


You can add a script in your package.json to use nodemon for easier development:
"scripts": {
  "start": "nodemon src/index.js"
}

3. Install the following dependencies in the frontend directory:
  - cd ../frontend
  - npm install react react-dom socket.io-client

4. Install and Run MongoDB

## Usage:

1. Start the MongoDB server:

2. Ensure you have MongoDB installed and running on your machine.

3. Run the backend server:cd backend
npm install
npm run dev

4. cd frontend
npm install
npm run dev

## Socket.IO Events
Client Events
message: Sends a message from the client to the server.
Server Events
message: Sends a response message from the server to the client.

## Technologies Used
Backend:
Node.js
Express.js
Mongoose (MongoDB)
Socket.IO
Axios
Fuse.js

Frontend:
React.js
Socket.IO Client




