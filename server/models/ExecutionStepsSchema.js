const mongoose = require('mongoose');

const executionStepsSchema = new mongoose.Schema(
  {
    stepNumber: {type: Number, required: true},
    stepName: { type: String, required: true },
    stepCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stepDescription: {type: String},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanSchema', required: true},
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


const ExecutionStepsSchema = mongoose.model('ExecutionStepsSchema', executionStepsSchema);

module.exports = ExecutionStepsSchema;
