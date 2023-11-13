const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const Post = require('../models/PostSchema');
const User = require('../models/UserSchema');
const Notification = require('../models/NotificationSchema')
const NotificationTypes = require('../enums/NotificationTypes');
const validateToken = require('../utils/validateToken');
const ReachabilityOptions = require('../enums/ReachabilityOptions');
const CommentControl = require('../enums/CommentControl')
// Create a new post

// Function to create notifications for user's friends
async function createNotificationsForFriends(userId, postId) {
  const friends = await Friend.findOne({ user: userId }).populate('friends.friendUser');
  const postNotificationType = NotificationTypes.POST;

  const notificationPromises = friends.friends.map(async (friend) => {
    const notification = new Notification({
      user: friend.friendUser._id,
      notificationType: postNotificationType,
      sourceId: postId, // You can set the source ID to the ID of the newly created post
      isRead: false, 
    });
    return notification.save();
  });

  await Promise.all(notificationPromises);
}


router.post('/create', async (req, res) => {
  try {
    const { user, payload, reachability, commentControl, mediaPayload, reactionCount, commentCount, shareCount } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!Object.values(ReachabilityOptions).includes(reachability.trim())) {
      return res.status(400).json({ error: 'Invalid reachability option.'});
    }

    if (!Object.values(CommentControl).includes(commentControl.trim())) {
      return res.status(400).json({ error: 'Invalid comment control option.'});
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

    //Creating Notifications for all the friend of the user
    await createNotificationsForFriends(user, savedPost._id);

    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Updating the saved post
router.put('/update/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const updates = req.body;

    // Additional checks for specific fields if they are present in updates
    if (updates.user) {
      const userExists = await User.findById(updates.user);
      if (!userExists) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    if (updates.reachability) {
      if (!Object.values(ReachabilityOptions).includes(updates.reachability.trim())) {
        return res.status(400).json({ error: 'Invalid reachability option.' });
      }
    }

    if (updates.commentControl) {
      if (!Object.values(CommentControl).includes(updates.commentControl.trim())) {
        return res.status(400).json({ error: 'Invalid comment control option.' });
      }
    }

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
    const { user, page, pageSize } = req.query;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const posts = await Post.find({user: user})
    .skip(skip)
    .limit(pageOptions.pageSize);

    const totalPosts = await Post.countDocuments({ user: user});

    const totalPages = Math.ceil(totalPosts / pageOptions.pageSize);

    res.status(200).json({
      posts,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalPosts,
    });
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
