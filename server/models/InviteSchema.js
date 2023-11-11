const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamName: {type: String, required: true, unique: true},
    invitedMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAccepted: {type: Boolean, default: false}, 
    didExpire: {type: Boolean, default: false},
    createdAt:{ type: Date, default: Date.now,},
    updatedAt: { type: Date, default: Date.now,},
});

const Invite = mongoose.model('InviteSchema', inviteSchema);
module.exports = Invite;