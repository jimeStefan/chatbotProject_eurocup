const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  stadium_id: String,
  name: String,
  location: String,
  capacity: Number,
});

module.exports = mongoose.models.Stadium || mongoose.model('Stadium', stadiumSchema);
