// models/problemSchema.js
const mongoose = require('mongoose');
const AiOptions = require('../enums/AiOptions');

const problemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  problemName: { type: String, required: true},
  aiOption: {type: String, enum: AiOptions, required: true},
  isDeleted: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,},
  updatedAt: {type: Date, default: Date.now,},
});

const ProblemSchema = mongoose.model('ProblemSchema', problemSchema);

module.exports = ProblemSchema;