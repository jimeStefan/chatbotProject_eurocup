const express = require('express');
const { handleMessage } = require('../controllers/chatbotController');
const router = express.Router();

router.post('/message', async (req, res) => {
  const { message, sessionId } = req.body;
  const response = await handleMessage(message, sessionId);
  res.json({ response });
});

module.exports = router;
