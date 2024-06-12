const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const Fuse = require('fuse.js');
const config = require('./config');
const routes = require('./routes');
const { getEuroCupTeams, getEuroCupPlayers } = require('./services/footballApiService');
const { Match, User, Conversation } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use('/api', routes);

const userSessions = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', async (message) => {
    const sessionId = socket.id;
    if (!userSessions[sessionId]) {
      userSessions[sessionId] = { history: [] };
    }

    const userSession = userSessions[sessionId];
    userSession.history.push({ text: message, sender: 'user' });

    try {
      let response;
      // Simple intent detection based on keywords
      if (message.toLowerCase().includes('teams')) {
        const teams = await getEuroCupTeams();
        response = teams.response.map(team => team.team.name).join(', ');
      } else if (message.toLowerCase().includes('players')) {
        const teamId = await extractTeamId(message); // Logic to extract teamId from message
        if (teamId) {
          const players = await getEuroCupPlayers(teamId);
          response = players.response.map(player => player.player.name).join(', ');
        } else {
          response = 'Please specify a valid team name.';
        }
      } else {
        response = "I'm sorry, I didn't understand that. Can you please rephrase?";
      }

      userSession.history.push({ text: response, sender: 'bot' });
      socket.emit('message', response);
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

// Function to extract teamId from the message
async function extractTeamId(message) {
  try {
    // Fetch team names and IDs from the database
    const teams = await Match.distinct('team1');
    const teamIds = await Match.distinct('match_id');
    const teamMap = teams.reduce((map, team, index) => {
      map[team] = teamIds[index];
      return map;
    }, {});

    // Create a Fuse instance for fuzzy string matching
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
