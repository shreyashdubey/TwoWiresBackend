const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema', required: true},
    reciever: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAccepted: {type: Boolean, default: false}, 
    didExpire: {type: Boolean, default: false},
    createdAt:{ type: Date, default: Date.now,},
    updatedAt: { type: Date, default: Date.now,},
});

const Invite = mongoose.model('InviteSchema', inviteSchema);
module.exports = Invite;