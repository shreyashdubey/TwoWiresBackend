// models/chatSchema.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  refId: { type: [mongoose.Schema.Types.ObjectId], ref: 'ChatSchema', required: true,},
  mediaType: { type: MediaType, required: true,},
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
