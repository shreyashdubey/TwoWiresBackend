const mongoose = require('mongoose');

// Creating using Parent-child tree or PreOrderTraversal or Materialized Path
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text: { type: String, required: true },
  path: { type: String, required: true }, // Materialized Path creation logic in routes
  reactionCount: {type: Number, default: 0, required: true},
  isDeleted: {type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PostComment = mongoose.model('PostComment', commentSchema);

module.exports = PostComment;
