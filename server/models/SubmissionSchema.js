const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true },
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  data: {type: String, required: true},
  isDeleted: {type: Boolean, default: false},
},
{
  timestamps: true,
}
);
const SkillSchema = mongoose.model('SkillSchema', skillSchema);
module.exports = SkillSchema;