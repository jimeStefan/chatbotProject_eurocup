const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io/',
  headers: {
    'x-rapidapi-key': '9e59e0123e84ca78fb2f9cd18709b990',
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
});

const getEuroCupTeams = async () => {
  try {
    const response = await apiClient.get('/teams', { params: { league: 4, season: 2024 } });
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

const getEuroCupPlayers = async (teamId) => {
  try {
    const response = await apiClient.get('/players', { params: { team: teamId, season: 2024 } });
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

module.exports = { getEuroCupTeams, getEuroCupPlayers };
