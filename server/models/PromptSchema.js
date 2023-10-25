// models/problemSolver/PromptSchema.js
const mongoose = require('mongoose');
// Creating using Parent-child tree or PreOrderTraversal or Materialized Path
const promptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemSchema', required: true },
  queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'InputOutputSchema', required: true },
  prompts: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

const PromptSchema = mongoose.model('PromptSchema', promptSchema);

module.exports = PromptSchema;
