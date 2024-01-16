const DiscussItemTypes = require('../enums/DiscussItemTypes');
const mongoose = require('mongoose');

const discussItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanSchema', required: false},
  executionStep: {type: mongoose.Schema.Types.ObjectId, ref: 'ExecutionStepsSchema', required: false},
  itemType: {type: String, enum: DiscussItemTypes, required: true},
  text: { type: String, required: true },
  path: { type: String, required: true }, // Materialized Path parent - child 
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  isDeleted: {type: Boolean, default: false},
},
{
    timestamps: true,
});

const DiscussItemSchema = mongoose.model('DiscussItemSchema', discussItemSchema);

module.exports = DiscussItemSchema;
