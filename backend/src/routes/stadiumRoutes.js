const express = require('express');
const Stadium = require('../models/stadiumModel');
const router = express.Router();

router.get('/stadiums', async (req, res) => {
  try {
    const stadiums = await Stadium.find();
    res.status(200).json(stadiums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
