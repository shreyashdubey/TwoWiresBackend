const TeamInviteStatus = require('../enums/TeamInviteStatus');
const mongoose = require('mongoose');

// Validation function to check for unique members
function isMemberUnique(value) {
    const members = this.members;
    const existingMembers = members.filter((member) => member.user.toString() === value.toString());
    return existingMembers.length === 0;
}
 
const teamSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: {type: String, required: true, unique: true},
  contest: [{type: mongoose.Schema.Types.ObjectId, ref: 'ContestSchema', required: true}],
  members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: {type: String, required: true},
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      inviteStatus: {type: String, enum: TeamInviteStatus, required: true},
      isDeleted: {type: Boolean, default: false},
    }],
    isDeleted: {type: Boolean, default: false},
    createdAt:{ type: Date, default: Date.now,},
    updatedAt: { type: Date, default: Date.now,},
});

// Add the custom validation to the 'members' array
teamSchema.path('members').validate({
    validator: isMemberUnique,
    message: 'Member already exists in the team.',
});

const Team = mongoose.model('TeamSchema', teamSchema);
module.exports = Team;