const express = require('express');
const { Match, Player, Team, RealTimeScore, HistoricalData } = require('./models');
const router = express.Router();

// Route to get all matches
router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a specific match
router.get('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get all players
router.get('/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a specific player
router.get('/players/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get real-time scores
router.get('/real-time-scores', async (req, res) => {
  try {
    const scores = await RealTimeScore.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get historical data
router.get('/historical-data', async (req, res) => {
  try {
    const data = await HistoricalData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
