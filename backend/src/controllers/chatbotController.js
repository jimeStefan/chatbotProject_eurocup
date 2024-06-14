const { getEuroCupTeams, getEuroCupPlayers } = require('../services/apiService');
const Fuse = require('fuse.js');
const Match = require('../models/matchModel');

const userSessions = {};

const handleMessage = async (message, sessionId) => {
  if (!userSessions[sessionId]) {
    userSessions[sessionId] = { history: [], fallbackCount: 0 };
  }

  const userSession = userSessions[sessionId];
  userSession.history.push({ text: message, sender: 'user' });

  let response;

  if (message.toLowerCase().includes('teams')) {
    const teams = await getEuroCupTeams();
    response = `The teams are:\n${teams.response.map(team => `- ${team.team.name}`).join('\n')}\nWould you like to know more?`;
  } else if (message.toLowerCase().includes('players')) {
    const teamId = await extractTeamId(message);
    if (teamId) {
      const players = await getEuroCupPlayers(teamId);
      response = `The players are:\n${players.response.map(player => `- ${player.player.name}`).join('\n')}\nAnything else you need?`;
    } else {
      response = 'Please specify a valid team name.';
    }
  } else {
    if (userSession.fallbackCount < 2) {
      response = "I'm sorry, I didn't understand that. Can you please rephrase?";
      userSession.fallbackCount++;
    } else {
      response = "It seems we're having trouble. Let's start over. What would you like to know about the Eurocup 2024?";
      userSession.fallbackCount = 0;
    }
  }

  userSession.history.push({ text: response, sender: 'bot' });
  return response;
};

async function extractTeamId(message) {
  try {
    const teams = await Match.distinct('team1');
    const teamIds = await Match.distinct('match_id');
    const teamMap = teams.reduce((map, team, index) => {
      map[team] = teamIds[index];
      return map;
    }, {});

    const fuse = new Fuse(teams, { keys: ['name'] });
    const result = fuse.search(message);

    if (result.length > 0) {
      const teamName = result[0].item;
      return teamMap[teamName];
    }
  } catch (err) {
    console.error('Error extracting teamId:', err);
  }

  return null;
}

module.exports = {
  handleMessage
};
