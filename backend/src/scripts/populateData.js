const mongoose = require('mongoose');
const config = require('../config');
const Match = require('../models/matchModel');
const Stadium = require('../models/stadiumModel');
const Player = require('../models/playerModel');

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    return Promise.all([
      Match.insertMany([
        {
          match_id: '1',
          date: new Date(),
          team1: 'Team A',
          team2: 'Team B',
          venue: 'Stadium 1',
          status: 'scheduled',
          score: { team1: 0, team2: 0 }
        },
        {
          match_id: '2',
          date: new Date(),
          team1: 'Team C',
          team2: 'Team D',
          venue: 'Stadium 2',
          status: 'scheduled',
          score: { team1: 0, team2: 0 }
        }
      ]),
      Stadium.insertMany([
        {
          stadium_id: '1',
          name: 'Stadium 1',
          location: 'City A',
          capacity: 50000
        },
        {
          stadium_id: '2',
          name: 'Stadium 2',
          location: 'City B',
          capacity: 60000
        }
      ]),
      Player.insertMany([
        {
          player_id: '1',
          name: 'Player 1',
          team_id: '1',
          position: 'Forward',
          nationality: 'Country A'
        },
        {
          player_id: '2',
          name: 'Player 2',
          team_id: '1',
          position: 'Midfielder',
          nationality: 'Country B'
        }
      ])
    ]);
  })
  .then(() => {
    console.log('Data populated');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB or inserting data:', err);
  });
