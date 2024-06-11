const { Match, Player, Team, HistoricalData } = require('../models');

async function handleUserMessage(message) {
  // Simple keyword-based intent recognition
  if (message.includes('schedule')) {
    const matches = await Match.find();
    return matches.map(match => `${match.team1} vs ${match.team2} on ${match.date}`).join('\n');
  } else if (message.includes('player')) {
    const players = await Player.find();
    return players.map(player => `${player.name} from ${player.team}`).join('\n');
  } else if (message.includes('history')) {
    const data = await HistoricalData.find();
    return data.map(item => `Year: ${item.year}, Champion: ${item.champion}`).join('\n');
  } else {
    return "I'm sorry, I didn't understand that. Can you please rephrase?";
  }
}

module.exports = {
  handleUserMessage
};
