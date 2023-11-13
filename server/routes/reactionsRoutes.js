const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const Comment = require('../models/PostCommentSchema')
const User = require('../models/UserSchema')
const Post = require('../models/PostSchema');
const Reaction = require('../models/ReactionsSchema');
const ReactionItems = require('../enums/ReactionItems');
const ReactionTypes = require('../enums/ReactionTypes');
const { response } = require('../app');

router.post('/create', async (req, res) => {
  const { user, reactionType, itemType, itemId } = req.body;
  try {

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!Object.values(ReactionItems).includes(itemType.trim())) {
        return res.status(400).json({ error: 'Invalid Item option.' });
    }
    
    if (!Object.values(ReactionTypes).includes(reactionType.trim())) {
        return res.status(400).json({ error: 'Invalid Reaction option.' });
    }

    if(itemType == ReactionItems.POST){
        const postExists = await Post.findById(itemId);
        if (!postExists) {
        return res.status(404).json({ error: 'Post not found.' });
        }

    }
    else if(itemType == ReactionItems.COMMENT){
        const commentExists = await Comment.findById(itemId);
        if (!commentExists) {
        return res.status(404).json({ error: 'Comment not found.' });
        }
        if(commentExists.isDeleted){
        return res.status(404).json({ error: 'Comment is deleted' });
        }
    }

    const newReaction = new Reaction({
        user,
        reactionType,
        itemType,
        itemId,
      });
      const savedReaction = await newReaction.save();
  
      res.status(201).json(savedReaction);


  } catch (err) {
    res.status(500).json({ error: 'Failed to create a new reaction.' });
  }
});

// Updating the saved reaction
router.put('/update/:ReactionId', async(req, res) => {
  const reactionId = req.params.ReactionId;
  try{
    
    const reactionExists = await Reaction.findById(reactionId);
    if (!reactionExists) {
      return res.status(404).json({ error: 'Reaction not found.' });
    }
    
    reactionExists.isDeleted = !reactionExists.isDeleted
    reactionExists.updatedAt = new Date();

    const updatedReaction = await reactionExists.save();

    res.status(200).json(updatedReaction);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.get('/get/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { user, itemType, page, pageSize } = req.query;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!Object.values(ReactionItems).includes(itemType.trim())) {
      return res.status(400).json({ error: 'Invalid Item option.' });
    }
    
    console.log("here",itemId)
    if(itemType == ReactionItems.POST){
        const postExists = await Post.findById(itemId);
        if (!postExists) {
        return res.status(404).json({ error: 'Post not found.' });
        }

    }
    else if(itemType == ReactionItems.COMMENT){
        const commentExists = await Comment.findById(itemId);
        if (!commentExists) {
        return res.status(404).json({ error: 'Comment not found.' });
        }
        if(commentExists.isDeleted){
        return res.status(404).json({ error: 'Comment is deleted' });
        }
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;


    const reactions = await Reaction.find({ itemId: itemId , itemType: itemType})
    .skip(skip)
    .limit(pageOptions.pageSize);

    const totalReactions = await Reaction.countDocuments({ itemId: itemId , itemType: itemType});

    const totalPages = Math.ceil(totalReactions / pageOptions.pageSize);
    
    res.status(200).json({
      reactions,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalReactions,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reactions.' });
  }
});

router.get('/get/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const {page, pageSize } = req.body;
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;


    const reactions = await Reaction.find({ user: userExists})
    .skip(skip)
    .limit(pageOptions.pageSize);

    const totalReactions = await Reaction.countDocuments({ user: userExists});

    const totalPages = Math.ceil(totalReactions / pageOptions.pageSize);
    
    res.status(200).json({
      reactions,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalReactions,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reactions for user' });
  }
});



module.exports = router;