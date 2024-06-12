const axios = require('axios');

const API_KEY = '9e59e0123e84ca78fb2f9cd18709b990';
const API_HOST = 'v3.football.api-sports.io';

const instance = axios.create({
  baseURL: `https://${API_HOST}`,
  headers: {
    'x-rapidapi-host': API_HOST,
    'x-rapidapi-key': API_KEY,
    'x-apisports-key': API_KEY,
  }
});

async function getEuroCupTeams() {
  try {
    const response = await instance.get('/teams', {
      params: { league: 4, season: 2024 }  // Use correct league ID for Euro Cup
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching teams:', err);
    throw err;
  }
}

async function getEuroCupPlayers(teamId) {
  try {
    const response = await instance.get('/players', {
      params: { team: teamId, season: 2024 }
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching players:', err);
    throw err;
  }
}

module.exports = {
  getEuroCupTeams,
  getEuroCupPlayers
};
