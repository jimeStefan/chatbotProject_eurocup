const express = require('express');
const { handleMessage } = require('../controllers/chatbotController');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  try {
    const response = await handleMessage(message, sessionId);
    res.json({ response });
  } catch (err) {
    console.error('Error handling message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
