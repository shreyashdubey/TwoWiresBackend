// models/problemSchema.js
const mongoose = require('mongoose');
const AiOptions = require('../enums/AiOptions');

const contestSchema = new mongoose.Schema({
  contestName: { type: String, required: true},
  contestOrganizer: {type: String, required: true},
  contestCreator: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,}],
  contestDescription: {type: mongoose.Schema.Types.ObjectId},
  totalTeamsRegistered: {type: Number, default: 0, required: true},
  isDeleted: {type: Boolean, default: false},
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true}
},
{
    timestamps: true
});

const ContestSchema = mongoose.model('ContestSchema', contestSchema);

module.exports = ContestSchema;