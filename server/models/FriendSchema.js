// models/Friend.js
const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
