// models/friendRequest.js
const FriendRequestStatus = require('../enums/FriendRequestStatus');
const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
    status: {type: String, enum: FriendRequestStatus, default: FriendRequestStatus.PENDING,},
    isDeleted: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
