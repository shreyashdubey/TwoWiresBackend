const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const Post = require('../models/PostSchema');
const User = require('../models/UserSchema');
const validateToken = require('../utils/validateToken');
// Create a new post

router.post('/create', async (req, res) => {
  try {
    const { user, payload, reachability, commentControl, mediaPayload, reactionCount, commentCount, shareCount } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newPost = new Post({
      user,
      payload,
      reachability,
      commentControl,
      mediaPayload,
      reactionCount,
      commentCount,
      shareCount,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
    console.log("Post saved hurray!!")
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Updating the saved post
router.put('/update/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const updates = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        post[key] = updates[key];
      }
    }

    post.updatedAt = new Date();

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all posts
router.get('/all', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
});

// Get a post by ID
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a post by ID
router.put('/delete/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if(post.isDeleted){
      return res.status(404).json({ error: 'Post is already deleted' });
    }
    post.isDeleted = true;
    post.updatedAt = new Date()

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
