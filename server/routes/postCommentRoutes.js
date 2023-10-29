const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const Comment = require('../models/PostCommentSchema')
const User = require('../models/UserSchema')
const Post = require('../models/PostSchema');
const { response } = require('../app');


// Creation of new comment directly to the post. The Materialised Path will be empty.
router.post('/create', async (req, res) => {
  const { user, post, text, reactionCount, parentCommentId } = req.body;
  try {
    // Check if the user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
    }

    // Check if the post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    let path;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found.' });
      }
      path = `${parentComment.path}/${parentComment._id}`;
    } else {
      path = " ";
    }

    console.log('Path:', path);
    const newComment = new Comment({
      user,
      post,
      text,
      reactionCount,
      path,
    });
    const savedComment = await newComment.save();

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create a new comment.' });
  }
});
// Updating the saved comment
router.put('/comments/update/:commentID', async(req, res) => {
  const { user, post, text} = req.body;
  const commentID = req.params.commentID;
  try{
      //Check if the user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
    }

    // Check if the post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Check if the comment exist and is not deleted
    const commentExists = await Comment.findById(commentID);
    if (!commentExists) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    if(commentExists.isDeleted){
      return res.status(404).json({ error: 'Comment is deleted' });
    }
    commentExists.text = text
    commentExists.updatedAt = new Date();

    const updatedComment = await commentExists.save();

    res.status(200).json(updatedComment);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }
});

// Deleting the saved comment
router.put('/comments/delete/:commentID', async(req, res) => {
  const { user, post} = req.body;
  const commentID = req.params.commentID;
  try{
      //Check if the user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
    }

    // Check if the post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Check if the comment exist and is not deleted
    const commentExists = await Comment.findById(commentID);
    if (!commentExists) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    if(commentExists.isDeleted){
      return res.status(404).json({ error: 'Comment is already deleted' });
    }
    commentExists.isDeleted = true
    commentExists.updatedAt = new Date();

    const updatedComment = await commentExists.save();

    res.status(200).json(updatedComment);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }
});

// Retrieving comment on a Post in a tree structure, look for the sort('path') function used, TODO- also give logic for UI 
router.get('/get/:postId', async (req, res) => {
  const postId = req.params.postId;
  try {
  const { user, page, pageSize } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;


    const comments = await Comment.find({ post: postId })
    .sort('path')
    .skip(skip)
    .limit(pageOptions.pageSize);

    const totalComments = await Comment.countDocuments({ user: user});

    const totalPages = Math.ceil(totalComments / pageOptions.pageSize);
    
    res.status(200).json({
      comments,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalComments,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Getting Replies to a specific comment. Path conversion - { $regex: `^${parentComment.path}/${commentId}` }
router.get('/comments/replies/:commentId', async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found.' });
    }

    const replies = await Comment.find({
      path: { $regex: `^${parentComment.path}/${commentId}` },
    });

    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch replies.' });
  }
});


module.exports = router;