const { getEuroCupTeams, getEuroCupPlayers, getEuroCupMatches, getLiveScores, getEuroCupStadiums, getEuroCupProgress, getHistoricalMatches, getMatchDetails } = require('../services/apiService');
const Fuse = require('fuse.js');

const userSessions = {};

const handleMessage = async (message, sessionId) => {
  if (!userSessions[sessionId]) {
    userSessions[sessionId] = { history: [], fallbackCount: 0, state: 'initial' };
  }

  const userSession = userSessions[sessionId];
  userSession.history.push({ text: message, sender: 'user' });

  let response;

  switch (userSession.state) {
    case 'initial':
      response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
      userSession.state = 'waitingForChoice';
      break;

    case 'waitingForChoice':
      if (message.toLowerCase().includes('teams')) {
        const teams = await getEuroCupTeams();
        response = `The teams are:\n${teams.response.map(team => `- ${team.team.name}`).join('\n')}\nWould you like to know more about a specific team?`;
        userSession.state = 'waitingForTeam';
      } else if (message.toLowerCase().includes('players')) {
        response = "Please specify the team name or country to get the list of players.";
        userSession.state = 'waitingForTeamName';
      } else if (message.toLowerCase().includes('matches')) {
        const matches = await getEuroCupMatches();
        const pastMatches = matches.response.filter(match => new Date(match.fixture.date) < new Date());
        const upcomingMatches = matches.response.filter(match => new Date(match.fixture.date) >= new Date());
        response = `Upcoming matches:\n${upcomingMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('\n')}\n\nPast matches:\n${pastMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('\n')}\nType the number of the match to get more details or 'back' to return to the main menu.`;
        userSession.matches = { past: pastMatches, upcoming: upcomingMatches };
        userSession.state = 'waitingForMatchSelection';
      } else if (message.toLowerCase().includes('live scores')) {
        const liveScores = await getLiveScores();
        response = liveScores.response.length === 0 ? "There are no live matches right now." : `Live scores:\n${liveScores.response.map(match => `- ${match.teams.home.name} ${match.goals.home} : ${match.goals.away} ${match.teams.away.name} (Status: ${match.fixture.status.long})`).join('\n')}`;
        userSession.state = 'initial';
      } else if (message.toLowerCase().includes('stadiums')) {
        const stadiums = await getEuroCupStadiums();
        response = `The stadiums are:\n${stadiums.response.map(stadium => `- ${stadium.name} in ${stadium.city}`).join('\n')}\nWould you like to know more about a specific stadium?`;
        userSession.state = 'waitingForStadium';
      } else if (message.toLowerCase().includes('eurocup progress')) {
        const progress = await getEuroCupProgress();
        response = `Current standings:\n${progress.response[0].league.standings[0].map(team => `- ${team.rank}. ${team.team.name} (${team.points} points)`).join('\n')}`;
        userSession.state = 'initial';
      } else if (message.toLowerCase().includes('historical matches')) {
        response = "Please specify the team name or country to get historical matches.";
        userSession.state = 'waitingForHistoricalTeam';
      } else if (message.toLowerCase().includes('restart')) {
        response = "Restarting the conversation. What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'.";
        userSessions[sessionId] = { history: [], fallbackCount: 0, state: 'initial' };
      } else {
        response = "Please type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
      }
      break;

    case 'waitingForMatchSelection':
      if (message.toLowerCase().includes('back')) {
        response = "Returning to the main menu. What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'.";
        userSession.state = 'initial';
      } else {
        const matchIndex = parseInt(message) - 1;
        if (isNaN(matchIndex) || matchIndex < 0 || matchIndex >= userSession.matches.past.length + userSession.matches.upcoming.length) {
          response = "Please specify a valid match number or type 'back' to return to the main menu.";
        } else {
          const selectedMatch = matchIndex < userSession.matches.upcoming.length
            ? userSession.matches.upcoming[matchIndex]
            : userSession.matches.past[matchIndex - userSession.matches.upcoming.length];
          const matchDetails = await getMatchDetails(selectedMatch.fixture.id);
          const match = matchDetails.response[0];
          response = `Match details:\n- ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}\n  Goals: ${match.goals.home} - ${match.goals.away}\n  Stadium: ${match.fixture.venue.name}\n  Players:\n    ${match.lineups[0].startXI.map(player => `- ${player.player.name}`).join('\n')}\n    ${match.lineups[1].startXI.map(player => `- ${player.player.name}`).join('\n')}\nWould you like to know more about another match or type 'back' to return to the main menu?`;
          userSession.state = 'waitingForMatchDetails';
        }
      }
      break;

    case 'waitingForMatchDetails':
      if (message.toLowerCase().includes('back')) {
        response = "Returning to the main menu. What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'.";
        userSession.state = 'initial';
      } else {
        response = "Please specify a valid match or type 'back' to return to the main menu.";
      }
      break;

    case 'waitingForTeam':
      response = "Please specify a valid team name or type 'players' to get the list of players for a team.";
      userSession.state = 'waitingForTeamName';
      break;

    case 'waitingForTeamName':
      const teamId = await extractTeamId(message);
      if (teamId) {
        const players = await getEuroCupPlayers(teamId);
        response = `The players are:\n${players.response.map(player => `- ${player.player.name}`).join('\n')}\nAnything else you need?`;
        userSession.state = 'initial';
      } else {
        response = "Please specify a valid team name or country.";
      }
      break;

    case 'waitingForHistoricalTeam':
      const historicalTeamId = await extractTeamId(message);
      if (historicalTeamId) {
        const historicalMatches = await getHistoricalMatches(historicalTeamId);
        response = `Historical matches:\n${historicalMatches.response.map(match => `- ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date} (Score: ${match.goals.home} - ${match.goals.away})`).join('\n')}`;
        userSession.state = 'initial';
      } else {
        response = "Please specify a valid team name or country.";
      }
      break;

    default:
      response = "I'm sorry, I didn't understand that. Can you please rephrase?";
      break;
  }

  userSession.history.push({ text: response, sender: 'bot' });
  return response;
};

async function extractTeamId(message) {
  try {
    const teams = await getEuroCupTeams();
    const teamMap = teams.response.reduce((map, team) => {
      map[team.team.name.toLowerCase()] = team.team.id;
      map[team.team.country.toLowerCase()] = team.team.id;
      return map;
    }, {});

    const fuse = new Fuse(Object.keys(teamMap), { includeScore: true });
    const result = fuse.search(message.toLowerCase());

    if (result.length > 0 && result[0].score < 0.4) { // Adjust the threshold as necessary
      const teamName = result[0].item;
      return teamMap[teamName];
    }
  } catch (err) {
    console.error('Error extracting teamId:', err);
  }

  return null;
}

async function extractMatchId(message, isPastMatch) {
  try {
    const matches = await getEuroCupMatches();
    const matchMap = matches.response.reduce((map, match) => {
      map[`${match.teams.home.name.toLowerCase()} vs ${match.teams.away.name.toLowerCase()} on ${match.fixture.date}`] = match.fixture.id;
      return map;
    }, {});

    const fuse = new Fuse(Object.keys(matchMap), { includeScore: true });
    const result = fuse.search(message.toLowerCase());

    if (result.length > 0 && result[0].score < 0.4) { // Adjust the threshold as necessary
      const matchName = result[0].item;
      return matchMap[matchName];
    }
  } catch (err) {
    console.error('Error extracting matchId:', err);
  }

  return null;
}

module.exports = {
  handleMessage
};

     
