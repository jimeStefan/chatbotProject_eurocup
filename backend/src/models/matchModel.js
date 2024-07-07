
const matchSchema = {
  match_id: String,
  date: Date,
  team1: String,
  team2: String,
  venue: String,
  status: String,
  score: {
    team1: Number,
    team2: Number,
  },
};

module.exports = matchSchema;
