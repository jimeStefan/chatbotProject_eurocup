const express = require('express');
const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const router = express.Router();

router.post('/', async (req, res) => {
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

router.get('/:userId', async (req, res) => {
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

module.exports = router;
