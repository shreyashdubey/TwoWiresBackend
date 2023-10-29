const mongoose = require('mongoose');
const ReactionOptions = require('../enums/ReactionOptions');
const ReactionTypes = require('../enums/ReactionTypes');
// Creating using Parent-child tree or PreOrderTraversal or Materialized Path
const reactionsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactionType: { type: String, enum: ReactionTypes, required: true},
    itemType: { type: String, enum: ReactionOptions, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemType'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

const ReactionsSchema = mongoose.model('REactionsSchema', reactionSchema);

module.exports = ReactionsSchema;
