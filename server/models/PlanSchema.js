const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    planCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planDescription: {type: String},
    executionSteps: [{type: mongoose.Schema.Types.ObjectId, ref: 'ExecutionStepsSchema'}],
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true },
    upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    isDeleted: { type: Boolean, default: false },
    isSubmitted: {type: Boolean, default: false},
    isUnderReview: {type: Boolean, default: false},
    isPublished: { type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);


const PlanSchema = mongoose.model('PlanSchema', planSchema);

module.exports = PlanSchema;
