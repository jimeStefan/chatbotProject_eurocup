const express = require('express');
const bcrypt = require('bcrypt');
const { Match, User, Conversation } = require('./models');
const { getEuroCupTeams, getEuroCupPlayers } = require('./services/apiService');
const router = express.Router();

// User authentication routes
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error:
        'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Conversation routes
  router.post('/conversations', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newConversation = new Conversation({ user: userId });
      await newConversation.save();
      res.status(201).json({ message: 'Conversation created successfully', conversation: newConversation });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/conversations/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const conversations = await Conversation.find({ user: userId }).populate('user');
      res.status(200).json(conversations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Test MongoDB connection
  router.get('/test-db', async (req, res) => {
    try {
      const matches = await Match.find();
      res.status(200).json(matches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Test API-SPORTS connection
  router.get('/test-api', async (req, res) => {
    try {
      const teams = await getEuroCupTeams();
      res.status(200).json(teams);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  module.exports = router;
  
