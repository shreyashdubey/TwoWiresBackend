const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillName: {type: String, required: true},
  isDeleted: {type: Boolean, default: false},
},
{
  timestamps: true,
}
);
const SkillSchema = mongoose.model('SkillSchema', skillSchema);
module.exports = SkillSchema;