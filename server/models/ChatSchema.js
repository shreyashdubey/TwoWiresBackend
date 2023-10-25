// models/chatSchema.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  members: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true,},
  chatName: { type: String,},
  createdAt:{ type: Date, default: Date.now,},
  updatedAt: { type: Date, default: Date.now,},
});

// Custom validation to ensure at least one of text, image, or video is present
chatSchema.pre('validate', function (next) {
  if (!this.members) {
    const err = new Error('A chat should have members');
    return next(err);
  }
  next();
});

const Post = mongoose.model('ChatSchema', chatSchema);

module.exports = Post;
