// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const Friend = require('../models/FriendSchema');
const Post = require('../models/PostSchema');

// Get the feed for a user
router.get('/feed/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user's friends
    const userFriends = await Friend.findOne({ user: userId }).populate('feed');

    if (!userFriends) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract the post IDs from the user's friends' feed
    const postIds = userFriends.feed.map(post => post._id);

    // Find the posts based on the post IDs
    const feedPosts = await Post.find({ _id: { $in: postIds } }).populate('user');

    res.json(feedPosts);
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

module.exports = router;
