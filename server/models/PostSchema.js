// models/post.js
const mongoose = require('mongoose');
const ReachabilityOptions = require('../enums/ReachabilityOptions');
const CommentControl = require('../enums/CommentControl')
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  payload: { type: String, required: true},
  reachability: {type: String, enum: ReachabilityOptions, default: "ANYONE", required: true},
  commentControl: {type: String, enum: CommentControl, default: "ANYONE" ,required: true},
  mediaPayload: {type: String, required: true},
  reactionCount: {type: Number, default: 0, required: true},
  commentCount: {type: Number, default: 0, required: true},
  shareCount: {type: Number, default: 0, required: true},
  isDeleted: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,},
  updatedAt: {type: Date, default: Date.now,},
});

// Custom validation to ensure at least one of text, image, or video is present
// postSchema.pre('validate', function (next) {
//   if (!this.text && !this.image && !this.video) {
//     const err = new Error('A post must have at least text, image, or video');
//     return next(err);
//   }
//   next();
// });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
