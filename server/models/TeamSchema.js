const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [{
      team: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }]
});
const Team = mongoose.model('TeamSchema', teamSchema);
module.exports = Team;