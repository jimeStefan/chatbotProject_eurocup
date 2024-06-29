const axios = require('axios');

const API_KEY = '9e59e0123e84ca78fb2f9cd18709b990'; // Replace with your API key
const API_HOST = 'v3.football.api-sports.io';

const instance = axios.create({
  baseURL: `https://${API_HOST}`,
  headers: {
    'x-rapidapi-host': API_HOST,
    'x-rapidapi-key': API_KEY,
    'x-apisports-key': API_KEY,
  },
});

async function getEuroCupTeams() {
  try {
    const response = await instance.get('/teams', {
      params: { league: 4, season: 2024 },
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
      params: { team: teamId, season: 2024 },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching players:', err);
    throw err;
  }
}

async function getEuroCupMatches() {
  try {
    const response = await instance.get('/fixtures', {
      params: { league: 4, season: 2024 },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching matches:', err);
    throw err;
  }
}

async function getLiveScores() {
  try {
    const response = await instance.get('/fixtures', {
      params: { live: 'all' },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching live scores:', err);
    throw err;
  }
}

async function getEuroCupStadiums() {
  try {
    const response = await instance.get('/venues', {
      params: { league: 4, season: 2024 },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching stadiums:', err);
    throw err;
  }
}

async function getEuroCupProgress() {
  try {
    const response = await instance.get('/standings', {
      params: { league: 4, season: 2024 },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching Eurocup progress:', err);
    throw err;
  }
}

async function getHistoricalMatches(teamId) {
  try {
    const response = await instance.get('/fixtures', {
      params: { team: teamId, league: 4, season: 2020 },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching historical matches:', err);
    throw err;
  }
}

async function getMatchDetails(matchId) {
  try {
    const response = await instance.get(`/fixtures?id=${matchId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching match details:', err);
    throw err;
  }
}

module.exports = {
  getEuroCupTeams,
  getEuroCupPlayers,
  getEuroCupMatches,
  getLiveScores,
  getEuroCupStadiums,
  getEuroCupProgress,
  getHistoricalMatches,
  getMatchDetails,
};
