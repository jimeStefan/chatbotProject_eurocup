const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  match_id: String,
  date: Date,
  team1: String,
  team2: String,
  venue: String,
  status: String,
  score: {
    team1: Number,
    team2: Number,
  },
});

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
