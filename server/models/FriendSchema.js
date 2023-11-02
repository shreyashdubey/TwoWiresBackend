const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  friends: [
    {
      friendUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      friendshipDate: { type: Date, default: Date.now }
    }
  ]
});
const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;