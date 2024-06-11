const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  match_id: String,
  date: Date,
  team1: String,
  team2: String,
  venue: String,
  status: String, // e.g., scheduled, ongoing, finished
  score: {
    team1: Number,
    team2: Number
  }
});

const playerSchema = new mongoose.Schema({
  player_id: String,
  name: String,
  team: String,
  position: String,
  statistics: {
    matches_played: Number,
    goals: Number,
    assists: Number,
    yellow_cards: Number,
    red_cards: Number
  }
});

const teamSchema = new mongoose.Schema({
  team_id: String,
  name: String,
  players: [String]
});

const realTimeScoreSchema = new mongoose.Schema({
  match_id: String,
  updates: [
    {
      time: Date,
      description: String,
      score: {
        team1: Number,
        team2: Number
      }
    }
  ]
});

const historicalDataSchema = new mongoose.Schema({
  year: Number,
  champion: String,
  runner_up: String,
  top_scorer: {
    name: String,
    goals: Number
  },
  matches: [String] // Array of match IDs
});

const Match = mongoose.model('Match', matchSchema);
const Player = mongoose.model('Player', playerSchema);
const Team = mongoose.model('Team', teamSchema);
const RealTimeScore = mongoose.model('RealTimeScore', realTimeScoreSchema);
const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

module.exports = {
  Match,
  Player,
  Team,
  RealTimeScore,
  HistoricalData
};
