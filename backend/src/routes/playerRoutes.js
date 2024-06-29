const express = require('express');
const Player = require('../models/playerModel');
const router = express.Router();

router.get('/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
