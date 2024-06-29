const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config');
const { handleMessage } = require('./controllers/chatbotController');

const conversationRoutes = require('./routes/conversationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

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

app.use('/api/conversations', conversationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);

const userSessions = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('message', 'Hello, how can I help?');

  socket.on('message', async (message) => {
    console.log('Received message:', message);
    const response = await handleMessage(message, socket.id);
    socket.emit('message', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete userSessions[socket.id];
  });
});

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
