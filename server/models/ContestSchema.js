// models/problemSchema.js
const mongoose = require('mongoose');
const AiOptions = require('../enums/AiOptions');

const contestSchema = new mongoose.Schema({
  contestName: { type: String, required: true},
  contestOrganizer: {type: String},
  contestCreator: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
  contestDescription: {type: mongoose.Schema.Types.ObjectId, ref: 'ContestDescriptionSchema'},
  totalTeamsRegistered: {type: Number, default: 0},
  isDeleted: {type: Boolean, default: false},
  startTime: {type: Date, required: false},
  endTime: {type: Date, required: false},
  isPublished: {type: Boolean, default: false},
  prize: {type: String}
},
{
    timestamps: true
});

const ContestSchema = mongoose.model('ContestSchema', contestSchema);

module.exports = ContestSchema;