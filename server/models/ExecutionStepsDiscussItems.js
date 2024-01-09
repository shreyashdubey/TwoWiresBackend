const DiscussItemTypes = require('../enums/DiscussItemTypes');
const mongoose = require('mongoose');

const executionStepsDiscussItems = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanSchema', required: true},
  itemType: {type: String, enum: DiscussItemTypes, required: true},
  text: { type: String, required: true },
  path: { type: String, required: true }, // Materialized Path creation logic in routes
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  isDeleted: {type: Boolean, default: false},
},
{
    timestamps: true,
});

const ExecutionStepsDiscussItems = mongoose.model('ExecutionStepsDiscussItems', executionStepsDiscussItems);

module.exports = ExecutionStepsDiscussItems;
