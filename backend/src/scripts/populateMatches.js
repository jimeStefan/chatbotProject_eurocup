const mongoose = require('mongoose');
const config = require('../config');
const Match = require('../models/matchModel');

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    return Match.insertMany([
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
      },
      {
        match_id: '3',
        date: new Date(),
        team1: 'Team E',
        team2: 'Team F',
        venue: 'Stadium 3',
        status: 'scheduled',
        score: { team1: 0, team2: 0 }
      },
      {
        match_id: '4',
        date: new Date(),
        team1: 'Team G',
        team2: 'Team H',
        venue: 'Stadium 4',
        status: 'scheduled',
        score: { team1: 0, team2: 0 }
      }
    ]);
  })
  .then(() => {
    console.log('Matches populated');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB or inserting matches:', err);
  });
