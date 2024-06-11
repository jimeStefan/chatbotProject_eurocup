const axios = require('axios');
const { RealTimeScore } = require('../models');

const API_URL = 'https://v3.football.api-sports.io/';  
const API_KEY = '9e59e0123e84ca78fb2f9cd18709b990';  

async function fetchAndUpdateScores() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const scores = response.data.response;  e

    // Assuming the API returns an array of match scores in 'response'
    for (const score of scores) {
      await RealTimeScore.updateOne(
        { match_id: score.fixture.id },
        { $push: { updates: { time: new Date(), description: 'Live update', score: `${score.goals.home} - ${score.goals.away}` } } },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Error fetching and updating scores:', err);
  }
}

module.exports = {
  fetchAndUpdateScores
};
