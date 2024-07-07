const fs = require('fs');
const path = require('path');
const { getEuroCupPlayers, getEuroCupMatches, getLiveScores, getMatchDetails} = require('../services/apiService');
const Fuse = require('fuse.js');
const {format} = require('date-fns'); //npm install date-fns

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
function includesAny(cleanedMessage, keywords) {
  return keywords.some(keyword => cleanedMessage.includes(keyword));
}
const teamsArray = ['england', 'france', 'germany', 'netherlands', 'portugal', 'spain', 'switzerland', 'turkiye', 'austria', 'belgium', 'denmark', 'georgia','italy', 'romania', 'slovakia', 'slovenia', 'albania', 'coatia', 'czechia', 'hungary', 'poland', 'scotland', 'serbia', 'ukraine'];

function includesTwoTeams(cleanedMessage){
  foundTeams = [];
  count = 0;
  for(team in teamsArray){
    if(cleanedMessage.includes(teamsArray[team])){
      count++;
      foundTeams.push(teamsArray[team]);
    }
    if(count == 2)
      return foundTeams;
  }
  return false;
}


async function getMatchDetailsBetweenTeams(teamA, teamB) {
  try {
    const matches = await getEuroCupMatches();
    const filteredMatches = matches.response.filter(match =>
        (match.teams.home.name.toLowerCase() === teamA.toLowerCase() && match.teams.away.name.toLowerCase() === teamB.toLowerCase()) ||
        (match.teams.home.name.toLowerCase() === teamB.toLowerCase() && match.teams.away.name.toLowerCase() === teamA.toLowerCase())
    );

    if (filteredMatches.length > 0) {
      const matchDetails = await Promise.all(filteredMatches.map(async (match) => {
        const details = await getMatchDetails(match.fixture.id);
        return details.response[0];
      }));

      return matchDetails.map(detail => (
          `Match date: ${format(new Date(detail.fixture.date), 'dd.MM')} at ${format(new Date(detail.fixture.date), 'HH:mm')}<br>` +
          `- ${detail.teams.home.name} vs ${detail.teams.away.name}<br>` +
          `<br>`+

          `- Goals: ${detail.goals.home} - ${detail.goals.away}<br>` +
          `<br>`+
          `- Status: ${detail.fixture.status.long}<br>` +
          `<br>`+
          `- Stadium: ${detail.fixture.venue.name}<br>` +
          `<br>`+
          `- ${detail.teams.home.name} Players:<br>` +
          `  ${detail.lineups[0].startXI.map(player => `- ${player.player.name}`).join(`<br>`)}<br>` +
          `<br>`+
          `- ${detail.teams.away.name} Players:<br>` +
          `  ${detail.lineups[1].startXI.map(player => `- ${player.player.name}`).join(`<br>`)}`
      )).join('\n\n');
    } else {
      return "No matches found between the specified teams.";
    }
  } catch (error) {
    console.error("Error fetching match details between teams:", error);
    return "There was an error fetching match details. Please try again later.";
  }
}

async function getTeamProgress(team) {
  try {
    const matches = await getEuroCupMatches();
    const filteredMatches = matches.response.filter(match =>
        (match.teams.home.name.toLowerCase() === team.toLowerCase() || match.teams.away.name.toLowerCase() === team.toLowerCase())
    );

    if (filteredMatches.length > 0) {
      const matchDetails = await Promise.all(filteredMatches.map(async (match) => {
        const details = await getMatchDetails(match.fixture.id);
        return details.response[0];
      }));

      return matchDetails.map(detail => (
          `Match date: ${format(new Date(detail.fixture.date), 'dd.MM')} at ${format(new Date(detail.fixture.date), 'HH:mm')}<br>` +
          `- ${detail.teams.home.name} vs ${detail.teams.away.name}<br>` +
          `- Goals: ${detail.goals.home} - ${detail.goals.away}<br>` +
          `- Status: ${detail.fixture.status.long}<br>` +
          `- Stadium: ${detail.fixture.venue.name}<br>`
      )).join('\n\n');
    } else {
      return "No progress found for this team.";
    }
  } catch (error) {
    console.error("Error fetching team progress:", error);
    return "There was an error fetching team progress. Please try again later.";
  }
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

  // keyword arrays for broader understanding
  const matchesKeywords = ['matches', 'games', 'fixtures'];
  const playersKeywords = ['players', 'squad', 'roster'];
  const matchKeywords = ['match', 'game', 'fixture'];
  switch (userSession.state) {
    case 'initial':
      response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
      userSession.state = 'waitingForChoice';
      break;

    case 'waitingForChoice':
      if (cleanedMessage.includes('teams')) { response = `The initial 24 teams are:<br>${eurocupProgress.teams.map((team, index) => `${index + 1}. ${team}`).join('<br>')}<br>Please tell me if you want to know anything about a specific team.`;
      //userSession.state = 'waitingForTeamSelection';

      } else if (includesAny(cleanedMessage,playersKeywords)) {

        const mentionedTeam = Object.keys(teams).find(team => cleanedMessage.includes(cleanText(team)))

        if (mentionedTeam){
          const players = await getEuroCupPlayers(teams[mentionedTeam]);
          response = `The players for ${mentionedTeam} are:<br>${players.response.map(player => `- ${player.player.name}`).join('<br>')}<br>What else would you like to know?`
        }else{
          response = "Please specify the team name or country to get the list of players.";
          userSession.state = 'waitingForTeamName';
        }
      }else if(includesAny(cleanedMessage,teamsArray) && includesAny(cleanedMessage, ["details", "progress", "matches", "details"]) && !includesTwoTeams(cleanedMessage)) {
        let response = "";
        const mentionedTeam = Object.keys(teams).find(team => cleanedMessage.includes(cleanText(team)))
        response = await getTeamProgress(mentionedTeam);
        return response;
      }else if(includesAny(cleanedMessage,["past", "previous"]) && includesAny(cleanedMessage,matchesKeywords)){
          let response = "";
          const matches = await getEuroCupMatches();
          const now = new Date();
          const pastMatches = matches.response.filter(match => new Date(match.fixture.date) < now);
          if (pastMatches.length > 0) {
            response += `Past matches:<br>${pastMatches.map((match, index) => {
              const formattedDate = format(new Date(match.fixture.date), 'dd.MM');
              const formattedTime = format(new Date(match.fixture.date), 'HH:mm');
              return `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${formattedDate} at ${formattedTime}`;
            }).join('<br>')}<br>`;
           } else {
            response += "There are no past matches.<br>";
          }
          response += "If you would like to know anything about a specific match we can provide additional information. Promt example: details on the game between Spain and Germany";
          return response;
      }else if(includesAny(cleanedMessage, ["next","future","upcomming", "upcoming"]) && includesAny(cleanedMessage, matchesKeywords)){
          let response = "";
          const matches = await getEuroCupMatches();
          const now = new Date();
          const upcomingMatches = matches.response.filter(match => new Date(match.fixture.date) >= now);
          if (upcomingMatches.length > 0) {
            response += `Upcoming matches:<br>${upcomingMatches.map((match, index) => {
              const formattedDate = format(new Date(match.fixture.date), 'dd.MM');
              const formattedTime = format(new Date(match.fixture.date), 'HH:mm');
              return `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${formattedDate} at ${formattedTime}.<br>`;
  
            }).join('<br>')}<br><br>`;
          } else {
            response += "There are no upcoming matches, if you would like to see all games, type games/matches/fixtures.<br><br>";
          }
          response += "If you would like to know anything about a specific match we can provide additional information. Promt example: details on the game between Spain and Germany";
          return response;
      }else if (includesAny(cleanedMessage,matchesKeywords)) {
         // Fetch and display Eurocup matches
        try {
          const matches = await getEuroCupMatches();
          const now = new Date();
          const pastMatches = matches.response.filter(match => new Date(match.fixture.date) < now);
          const upcomingMatches = matches.response.filter(match => new Date(match.fixture.date) >= now);

          let response = '';
          if (upcomingMatches.length > 0) {
            response += `Upcoming matches:<br>${upcomingMatches.map((match, index) => {
              const formattedDate = format(new Date(match.fixture.date), 'dd.MM');
              const formattedTime = format(new Date(match.fixture.date), 'HH:mm');
              return `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${formattedDate} at ${formattedTime}.<br>`;
              
            }).join('<br>')}<br><br>`;
          } else {
            response += "There are no upcoming matches.<br><br>";
          }
          if (pastMatches.length > 0) {
            response += `Past matches:<br>${pastMatches.map((match, index) => {
              const formattedDate = format(new Date(match.fixture.date), 'dd.MM');
              const formattedTime = format(new Date(match.fixture.date), 'HH:mm');
              return `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${formattedDate} at ${formattedTime}`;
            }).join('<br>')}<br>`;
          } else {
            response += "There are no past matches.<br>";
          }
          response += "If you would like to know anything about a specific match we can provide additional information. Promt example: details on the game between Spain and Germany";
          //response += "Please select a match by number.";
          //userSession.state = 'waitingForMatchSelection';  // Update session state
          return response;
        } catch (error) {
          console.error("Error fetching matches:", error);
          response = "There was an error fetching matches. Please try again later.";
          userSession.state = 'waitingForChoice';
          return response;
        }
      } else if (cleanedMessage.includes('live scores')) {
        try {
          const liveScores = await getLiveScores(); // Call API to fetch live scores
          if (liveScores.response.length === 0) {
            response = "There are no live matches right now.";
          } else {
            response = `Live scores:<br>${liveScores.response.map(match => `- ${match.teams.home.name} ${match.goals.home} : ${match.goals.away} ${match.teams.away.name} (Status: ${match.fixture.status.long})`).join('<br>')}`;
          }
          userSession.state = 'waitingForChoice';
        } catch (error) {
          console.error("Error fetching live scores:", error);
          response = "There was an error fetching live scores. Please try again later.";
          userSession.state = 'waitingForChoice';
        }
      } else if (cleanedMessage.includes('stadiums')) {
         // List stadiums and prompt user to select one
        response = `The stadiums are:<br>${Object.keys(stadiums).map((stadium, index) => `${index + 1}. ${stadium}`).join('<br>')}<br>Would you like to know additional information about a stadium?<br>If yes, enter the stadiums number, otherwise, just type no.`;
        userSession.state = 'waitingForStadiumSelection';
      } else if (cleanedMessage.includes('eurocup progress')) {
        response = `Eurocup progress:<br>Current Stage: ${eurocupProgress.currentStage}<br>Teams: ${eurocupProgress.teams.join(', ')}<br><br>`;
        userSession.state = 'waitingForChoice';
      } else if (cleanedMessage.includes('historical matches')) {
        response = "Please specify the team name or country to get historical matches.";
        userSession.state = 'waitingForHistoricalTeam';
      }else if(includesTwoTeams(cleanedMessage)) {
          const teamsForDetails = includesTwoTeams(cleanedMessage);
          response = await getMatchDetailsBetweenTeams(teamsForDetails[0], teamsForDetails[1]);
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
            response = `Match details:<br>${matchDetails.response.map(match => `- ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}<br>  Goals: ${match.goals.home} - ${match.goals.away}<br>  Stadium: ${match.fixture.venue.name}<br>  ${match.teams.home.name} Players:<br>    ${match.lineups[0].startXI.map(player => `- ${player.player.name}`).join('<br>')}<br>    ${match.teams.away.name} Players:<br>${match.lineups[1].startXI.map(player => `- ${player.player.name}`).join('<br>')}`).join('<br>')}`;
            userSession.state = 'waitingForChoice';
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
        response = `The players for ${selectedTeam} are:<br>${players.response.map(player => `- ${player.player.name}`).join('<br>')}<br>Would you like to select another team? Press 'yes' or 'no'.`;
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
        userSession.state = 'waitingForChoice';
      } else {
        response = "I didn't understand that. Please respond with 'yes' or 'no'.";
        }
        break;

        case 'waitingForStadiumSelection':
          response = "";
          if(cleanedMessage === "no"){
            userSession.state = 'waitingForChoice';
            response = "What else can I help you with?";
            return response;
          }
          const stadiumIndex = parseInt(cleanedMessage) - 1;
          const stadiumKeys = Object.keys(stadiums);
          if (stadiumIndex >= 0 && stadiumIndex < stadiumKeys.length) {
            const selectedStadium = stadiumKeys[stadiumIndex];
            const stadiumInfo = stadiums[selectedStadium];  // Get stadium info from stadiums file

            if (stadiumInfo) {
                // Construct response with stadium information
              const location = stadiumInfo.location ? `- Location: ${stadiumInfo.location}<br>` : '';
              const capacity = stadiumInfo.capacity ? `- Capacity: ${stadiumInfo.capacity}<br>` : '';
              const homeTeam = stadiumInfo.homeTeam ? `- Home Team: ${stadiumInfo.home_Team}<br>` : '';

              response = `Information about ${selectedStadium}:<br>${location}${capacity}${homeTeam}<br>Would you like to know about another stadium? (yes or no)`;
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
            response = `The stadiums are:<br>${Object.keys(stadiums).map((stadium, index) => `${index + 1}. ${stadium}`).join('<br>')}<br>Please select a stadium by number.`;
            userSession.state = 'waitingForStadiumSelection';
          } else if (cleanedMessage === 'no') {
              // User does not want to know about another stadium
            response = "What would you like to know about? Type 'teams', 'players', 'matches', 'live scores', 'stadiums', 'Eurocup progress', or 'historical matches'. You can also type 'restart' to start over.";
            userSession.state = 'waitingForChoice';
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
          response = `The players for ${teamFound} are:<br>${players.response.map(player => `- ${player.player.name}`).join('<br>')}<br>Would you like to know more about this team or another team?`;
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
              response = `Historical matches for ${historicalTeamFound}:<br>${teamMatches.map((match, index) => `${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} on ${match.fixture.date}`).join('<br>')}<br>Please select a match by number.`;
              userSession.state = 'waitingForMatchSelection';
            } else {
              response = `No historical matches found for ${historicalTeamFound}.`;
              userSession.state = 'waitingForChoice';
            }
          } catch (error) {
            console.error("Error fetching historical matches:", error);
            response = "There was an error fetching historical matches. Please try again later.";
            userSession.state = 'waitingForChoice';
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
  