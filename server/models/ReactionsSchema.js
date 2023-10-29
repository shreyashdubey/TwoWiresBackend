const mongoose = require('mongoose');
const ReactionItems = require('../enums/ReactionItems');
const ReactionTypes = require('../enums/ReactionTypes');
// Creating using Parent-child tree or PreOrderTraversal or Materialized Path
const reactionsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactionType: { type: String, enum: ReactionTypes, required: true},
    itemType: { type: String, enum: ReactionItems, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemType'},
    isDeleted:{type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

const ReactionsSchema = mongoose.model('ReactionsSchema', reactionsSchema);

module.exports = ReactionsSchema;
