const express = require('express');
const Match = require('../models/matchModel');
const router = express.Router();

router.get('/test-db', async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;