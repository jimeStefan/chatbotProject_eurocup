const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config');
const routes = require('./routes');
const { fetchAndUpdateScores } = require('./services/apiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use('/api', routes);

const { handleUserMessage } = require('./services/nlpService');

// When a user sends a message
// it handles the message using the handleUserMessage() function from the nlpService 
//it emits a response back to the client
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', async (message) => {
    console.log('Message received:', message);
    const response = await handleUserMessage(message);
    socket.emit('message', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

//code connects to MongoDB using mongoose.connect(). 
//It uses the URI defined in the config module.


mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Schedule the score fetching service to run every minute
setInterval(fetchAndUpdateScores, 60 * 1000);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
