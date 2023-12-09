const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  participant: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema' },
  },
  data: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const SubmissionSchema = mongoose.model('Submission', submissionSchema);

module.exports = SubmissionSchema;
