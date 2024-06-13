const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const Fuse = require('fuse.js');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { getEuroCupTeams, getEuroCupPlayers } = require('./services/apiService');
const { Match, User, Conversation } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cors());
app.use('/api', routes);

const userSessions = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', async (message) => {
    const sessionId = socket.id;
    if (!userSessions[sessionId]) {
      userSessions[sessionId] = { history: [], fallbackCount: 0 };
    }

    const userSession = userSessions[sessionId];
    userSession.history.push({ text: message, sender: 'user' });

    try {
      let response;
      if (message.toLowerCase().includes('teams')) {
        const teams = await getEuroCupTeams();
        response = `The teams are: ${teams.response.map(team => team.team.name).join(', ')}. Would you like to know more?`;
      } else if (message.toLowerCase().includes('players')) {
        const teamId = await extractTeamId(message);
        if (teamId) {
          const players = await getEuroCupPlayers(teamId);
          response = `The players are: ${players.response.map(player => player.player.name).join(', ')}. Anything else you need?`;
        } else {
          response = 'Please specify a valid team name.';
        }
      } else {
        if (userSession.fallbackCount < 2) {
          response = "I'm sorry, I didn't understand that. Can you please rephrase?";
          userSession.fallbackCount++;
        } else {
          response = "It seems we're having trouble. Let's start over. What would you like to know about the Eurocup 2024?";
          userSession.fallbackCount = 0;
        }
      }

      userSession.history.push({ text: response, sender: 'bot' });
      socket.emit('message', response);

      const user = await User.findOne({ username: 'testuser' }); // Replace with actual user identification logic
      if (user) {
        const conversation = await Conversation.findOne({ user: user._id });
        if (conversation) {
          conversation.messages.push({ text: message, sender: 'user' });
          conversation.messages.push({ text: response, sender: 'bot' });
          await conversation.save();
        } else {
          const newConversation = new Conversation({
            user: user._id,
            messages: [
              { text: message, sender: 'user' },
              { text: response, sender: 'bot' }
            ]
          });
          await newConversation.save();
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
      socket.emit('message', 'An error occurred while processing your request.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    delete userSessions[socket.id];
  });
});

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

async function extractTeamId(message) {
  try {
    const teams = await Match.distinct('team1');
    const teamIds = await Match.distinct('match_id');
    const teamMap = teams.reduce((map, team, index) => {
      map[team] = teamIds[index];
      return map;
    }, {});

    const fuse = new Fuse(teams, { keys: ['name'] });
    const result = fuse.search(message);

    if (result.length > 0) {
      const teamName = result[0].item;
      return teamMap[teamName];
    }
  } catch (err) {
    console.error('Error extracting teamId:', err);
  }

  return null;
}
