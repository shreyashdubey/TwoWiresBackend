const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    contestName: { type: String, required: true },
    contestOrganizer: { type: String },
    contestCreator: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    plans: [{type: mongoose.Schema.Types.ObjectId, ref: 'PlanSchema'}],
    contestDescription: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestDescriptionSchema' },
    totalTeamsRegistered: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    startTime: { type: Date, required: false },
    endTime: { type: Date, required: false },
    isSubmitted: {type: Boolean, default: false},
    isUnderReview: {type: Boolean, default: false},
    isPublished: { type: Boolean, default: false },
    prize: { type: String },
  },
  {
    timestamps: true,
  }
);

// Adding pre-save middleware for date validation
contestSchema.pre('save', function (next) {
  if (this.startTime && this.endTime && this.startTime > this.endTime) {
    const error = new Error('End date must be greater than or equal to start date.');
    return next(error);
  }
  next();
});

const ContestSchema = mongoose.model('ContestSchema', contestSchema);

module.exports = ContestSchema;
