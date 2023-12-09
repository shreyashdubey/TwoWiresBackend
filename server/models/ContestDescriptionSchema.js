const mongoose = require('mongoose');

const contestDescriptionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubmissonSchema' }],
  subtitle: { type: String, required: true },
  overview: { type: String, required: true },
  description: { type: String, required: true },
  evaluation: { type: String, required: true },
  timeline: [{ type: String, required: true }],
  tags: [{ type: String, required: true }],
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      team: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema' },
    },
  ],
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const ContestDescriptionSchema = mongoose.model('ContestDescriptionSchema', contestDescriptionSchema);

module.exports = ContestDescriptionSchema;
