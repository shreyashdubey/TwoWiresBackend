// models/problemSolver/InputOutputSchema.js
const mongoose = require('mongoose')
const SenderOptions = require('../enums/SenderOptions');
// Creating using Parent-child tree or PreOrderTraversal or Materialized Path
const inputOutputSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemSchema', required: true },
  sender: {type: String, enum: Object.values(SenderOptions), required: true},
  text: { type: String, required: true },
  path: { type: String, required: true }, // Materialized Path creation logic in routes
  createdAt: { type: Date, default: Date.now },
});

const InputOutputSchema = mongoose.model('InputOutputSchema', inputOutputSchema);

module.exports = InputOutputSchema;
