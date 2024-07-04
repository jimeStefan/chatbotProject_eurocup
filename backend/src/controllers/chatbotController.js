const fs = require('fs');
const path = require('path');
const { getEuroCupPlayers, getEuroCupMatches, getLiveScores, getMatchDetails } = require('../services/apiService');
const Fuse = require('fuse.js');

const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teams.json')));
const stadiums = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stadiums.json')));

const userSessions = {};

// Function to clean text (lowercase, remove punctuation, trim)
function cleanText(text) {
  text = text.toLowerCase();
  text = text.replace(/[^\w\s]/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Model to represent Eurocup progress
let eurocupProgress = {
  currentStage: 'Group Stage', // Initial stage
  teams: Object.keys(teams), // Initial list of teams
};

const initialEurocupProgress = { ...eurocupProgress }; // Keep a copy of initial progress

async function handleMessage(message, sessionId) {
   // Initialize user session if it doesn't exist
  if (!userSessions[sessionId]) {
    userSessions[sessionId] = { history: [], fallbackCount: 0, state: 'initial' };
  }

  const userSession = userSessions[sessionId];
  userSession.history.push({ text: message, sender: 'user' });

  let response;
  const cleanedMessage = cleanText(message);

  switch (userSession.state) {
    case 'initial':
      response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
      userSession.state = 'waitingForChoice';
      break;

    case 'waitingForChoice':
      if (cleanedMessage.includes('teams')) { response = `The initial 24 teams are:\n${eurocupProgress.teams.map((team, index) => `${index + 1}. ${team}`).join('\n')}\nPlease select a team by number.`;
      userSession.state = 'waitingForTeamSelection';
        
      } else if (cleanedMessage.includes('players')) {
        response = "Please specify the team name or country to get the list of players.";
        userSession.state = 'waitingForTeamName';
      } else if (cleanedMessage.includes('matches')) {
         // Fetch and display Eurocup matches
        try {
          const matches = await getEuroCupMatches();
          const now = new Date();
          const pastMatches = matches.response.filter(match => new Date(match.fixture.date) < now);
          const upcomingMatches = matches.response.filter(match => new Date(match.fixture.date) >= now);

          let response = '';
          if (upcomingMatches.length > 0) {
            response += `Upcoming matches:\n${upcomingMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('\n')}\n\n`;
          } else {
            response += "There are no upcoming matches.\n\n";
          }
          if (pastMatches.length > 0) {
            response += `Past matches:\n${pastMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('\n')}\n`;
          } else {
            response += "There are no past matches.\n";
          }

          response += "Please select a match by number.";
          userSession.state = 'waitingForMatchSelection';  // Update session state
          return response;
        } catch (error) {
          console.error("Error fetching matches:", error);
          response = "There was an error fetching matches. Please try again later.";
          userSession.state = 'initial';
          return response;
        }
      } else if (cleanedMessage.includes('live scores')) {
        try {
          const liveScores = await getLiveScores(); // Call API to fetch live scores
          if (liveScores.response.length === 0) {
            response = "There are no live matches right now.";
          } else {
            response = `Live scores:\n${liveScores.response.map(match => `- ${match.teams.home.name} ${match.goals.home} : ${match.goals.away} ${match.teams.away.name} (Status: ${match.fixture.status.long})`).join('\n')}`;
          }
          userSession.state = 'initial';
        } catch (error) {
          console.error("Error fetching live scores:", error);
          response = "There was an error fetching live scores. Please try again later.";
          userSession.state = 'initial';
        }
      } else if (cleanedMessage.includes('stadiums')) {
         // List stadiums and prompt user to select one
        response = `The stadiums are:\n${Object.keys(stadiums).map((stadium, index) => `${index + 1}. ${stadium}`).join('\n')}\nPlease select a stadium by number.`;
        userSession.state = 'waitingForStadiumSelection';
      } else if (cleanedMessage.includes('eurocup progress')) {
        response = `Eurocup progress:\nCurrent Stage: ${eurocupProgress.currentStage}\nTeams: ${eurocupProgress.teams.join(', ')}\n\n`;
        userSession.state = 'initial';
      } else if (cleanedMessage.includes('historical matches')) {
        response = "Please specify the team name or country to get historical matches.";
        userSession.state = 'waitingForHistoricalTeam';
      } else if (cleanedMessage.includes('restart')) {
        response = "Restarting the conversation. What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'.";
        userSessions[sessionId] = { history: [], fallbackCount: 0, state: 'initial' };
      } else {
         // Handle unrecognized input
        response = "Please type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
      }
      break;

    case 'waitingForMatchSelection':
      //user's selection of a match
      const matchIndex = parseInt(cleanedMessage) - 1;
      try {
        const matches = await getEuroCupMatches();
        const pastMatches = matches.response.filter(match => new Date(match.fixture.date) < new Date());
        const upcomingMatches = matches.response.filter(match => new Date(match.fixture.date) >= new Date());
        const allMatches = [...upcomingMatches, ...pastMatches]; // Combine matches
        const selectedMatch = allMatches[matchIndex];

        if (selectedMatch) {
          try {
            const matchDetails = await getMatchDetails(selectedMatch.fixture.id);
            response = `Match details:\n${matchDetails.response.map(match => `- ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}\n  Goals: ${match.goals.home} - ${match.goals.away}\n  Stadium: ${match.fixture.venue.name}\n  Players:\n    ${match.lineups[0].startXI.map(player => `- ${player.player.name}`).join('\n')}\n    ${match.lineups[1].startXI.map(player => `- ${player.player.name}`).join('\n')}`).join('\n')}`;
            userSession.state = 'initial';
          } catch (error) {
            console.error("Error fetching match details:", error);
            response = "There was an error fetching match details. Please try again later.";
          }
        } else {
          response = "Please select a valid match number.";
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        response = "There was an error fetching match data. Please try again later.";
      }
      break;

    case 'waitingForTeamSelection':
      const teamIndex = parseInt(cleanedMessage) - 1;
      const selectedTeam = eurocupProgress.teams[teamIndex];
      if (selectedTeam) {
        const players = await getEuroCupPlayers(teams[selectedTeam]);
        response = `The players for ${selectedTeam} are:\n${players.response.map(player => `- ${player.player.name}`).join('\n')}\nWould you like to select another team? Press 'yes' or 'no'.`;
        userSession.state = 'waitingForTeamSelectionFollowUp';
      } else {
        response = "Please select a valid team number.";
      }
      break;

    case 'waitingForTeamSelectionFollowUp':
      if (cleanedMessage.toLowerCase() === 'yes') {
        response = "Sure! Please select another team by number.";
        userSession.state = 'waitingForTeamSelection';
      } else if (cleanedMessage.toLowerCase() === 'no') {
        response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
        userSession.state = 'initial';
      } else {
        response = "I didn't understand that. Please respond with 'yes' or 'no'.";
        }
        break;
      
        case 'waitingForStadiumSelection':
          const stadiumIndex = parseInt(cleanedMessage) - 1;
          const stadiumKeys = Object.keys(stadiums);
          if (stadiumIndex >= 0 && stadiumIndex < stadiumKeys.length) {
            const selectedStadium = stadiumKeys[stadiumIndex];
            const stadiumInfo = stadiums[selectedStadium];  // Get stadium info from stadiums file

            if (stadiumInfo) {
                // Construct response with stadium information
              const location = stadiumInfo.location ? `- Location: ${stadiumInfo.location}\n` : '';
              const capacity = stadiumInfo.capacity ? `- Capacity: ${stadiumInfo.capacity}\n` : '';
              const homeTeam = stadiumInfo.homeTeam ? `- Home Team: ${stadiumInfo.home_Team}\n` : '';
        
              response = `Information about ${selectedStadium}:\n${location}${capacity}${homeTeam}\nWould you like to know about another stadium? (yes or no)`;
              userSession.state = 'waitingForAnotherStadium';
            } else {
              response = "Stadium information is not available."; // Handle case where stadium information is missing
              userSession.state = 'waitingForChoice';// Update session state to wait for user confirmation
            }
          } else {
            response = "Please select a valid stadium number."; // Handle invalid stadium selection
          }
          break;
        
        case 'waitingForAnotherStadium':
          // Handle user response after providing stadium information
          if (cleanedMessage === 'yes') {
            response = `The stadiums are:\n${Object.keys(stadiums).map((stadium, index) => `${index + 1}. ${stadium}`).join('\n')}\nPlease select a stadium by number.`;
            userSession.state = 'waitingForStadiumSelection';
          } else if (cleanedMessage === 'no') {
              // User does not want to know about another stadium
            response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
            userSession.state = 'initial';
             // Handle unrecognized response
          } else {
            response = "I didn't understand that. Please respond with 'yes' or 'no'.";
            userSession.state = 'waitingForAnotherStadium';
          }
          break;
        
  
      case 'waitingForTeamName':
        const teamFound = Object.keys(teams).find(team => cleanedMessage.includes(cleanText(team)));
        if (teamFound) {
          const players = await getEuroCupPlayers(teams[teamFound]);
          response = `The players for ${teamFound} are:\n${players.response.map(player => `- ${player.player.name}`).join('\n')}\nWould you like to know more about this team or another team?`;
          userSession.state = 'waitingForTeamSelectionFollowUp';
        } else {
          response = "Team not found. Please specify a valid team name or country.";
        }
        break;
  
      case 'waitingForHistoricalTeam':
         // Handle user request for historical matches based on team name or country
        const historicalTeamFound = Object.keys(teams).find(team => cleanedMessage.includes(cleanText(team)));
        if (historicalTeamFound) {
          try {
            const matches = await getEuroCupMatches();
            const teamMatches = matches.response.filter(match => match.teams.home.name === historicalTeamFound || match.teams.away.name === historicalTeamFound);
            if (teamMatches.length > 0) {
              response = `Historical matches for ${historicalTeamFound}:\n${teamMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('\n')}\nPlease select a match by number.`;
              userSession.state = 'waitingForMatchSelection';
            } else {
              response = `No historical matches found for ${historicalTeamFound}.`;
              userSession.state = 'initial';
            }
          } catch (error) {
            console.error("Error fetching historical matches:", error);
            response = "There was an error fetching historical matches. Please try again later.";
            userSession.state = 'initial';
          }
        } else {
          response = "Team not found. Please specify a valid team name or country.";
        }
        break;
  
      default:
        // Handle default case for unrecognized input
        response = "I'm sorry, I didn't understand that.";
        break;
    }
  
    userSession.history.push({ text: response, sender: 'bot' });
    return response;
  }
  
  module.exports = {
    handleMessage,
  };
  