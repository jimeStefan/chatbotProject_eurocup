const mongoose = require('mongoose');

// Define Match schema
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

// Create index on the date field
matchSchema.index({ date: 1 });

const Match = mongoose.model('Match', matchSchema);

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Define Conversation schema
const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    text: { type: String, required: true },
    sender: { type: String, enum: ['user', 'bot'], required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create index on the user field
conversationSchema.index({ user: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Match, User, Conversation };
