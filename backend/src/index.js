const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config');
const { handleMessage } = require('./controllers/chatbotController'); // Ensure handleMessage is imported correctly
const { join } = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.use(express.static(join(__dirname, '../../frontend/build')));
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('message', 'Hello, how can I help?');

  socket.on('message', async (message) => {
    console.log('Received message:', message);
    const response = await handleMessage(message, socket.id); // Use handleMessage function to process message
    socket.emit('message', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
