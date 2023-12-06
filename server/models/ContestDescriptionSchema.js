const mongoose = require('mongoose');

const contestDescriptionSchema = new mongoose.Schema({
  admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true},
  submissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'SubmissonSchema'}],
  subtitle: {type: String, required: true},
  overview: {type: String, required: true},
  description: {type: String, reqiured: true},
  evaluation: {type: String, required: true},
  timeline: [{type: String, reqiured: true}],
  tags: [{type: String, required: true}],
  activeParticipants: [{type: mongoose.Schema.ObjectId, ref: 'User', required: true}],
  registeredParticipants: [{type: mongoose.Schema.ObjectId, ref: 'User', required: true}],
  isDeleted: {type: Boolean, default: false},
},
{
    timestamps: true
});

const ContestDescriptionSchema = mongoose.model('ContestDescriptionSchema', contestDescriptionSchema);

module.exports = ContestDescriptionSchema;