const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  player_id: String,
  name: String,
  team_id: String,
  position: String,
  nationality: String,
});

module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);
