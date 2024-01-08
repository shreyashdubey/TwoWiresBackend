const DiscussItemTypes = require('../enums/DiscussItemTypes');
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanSchema', required: true},
  itemType: {type: String, enum: DiscussItemTypes, required: true},
  text: { type: String, required: true },
  path: { type: String, required: true }, // Materialized Path creation logic in routes
  upVotes: {type: Number, default: 0, required: true},
  downVotes: {type: Number, default: 0, required: true},
  isDeleted: {type: Boolean, default: false},
},
{
    timestamps: true,
});

const PostComment = mongoose.model('PostComment', commentSchema);

module.exports = PostComment;
