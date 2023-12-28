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
// Update the saved notification
router.put('/get-notification/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    
    res.status(200).json();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all notifications
router.get('/all', async (req, res) => {
  try {
    const { userId, page, pageSize } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;
    //TODO: Check if two calls to the same table be avoided
    const notifications = await Notification.find({user: user, isDeleted: false})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(pageOptions.pageSize);

    // Mark all retrieved notifications as read
    await Notification.updateMany(
      { user: user, _id: { $in: notifications.map(notification => notification._id) } },
      { $set: { isRead: true } }
    );

    const totalNotifications = await Notification.countDocuments({ user: user, isDeleted: false});

    const totalPages = Math.ceil(totalNotifications / pageOptions.pageSize);

    res.status(200).json({
      notifications,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalNotifications,
    });
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
});

// Get a notification by ID or open it by an Id
router.get('/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findById(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  

// Delete a post by ID - You might need delete all afterwards
router.put('/delete/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if(notification.isDeleted){
      return res.status(404).json({ error: 'Notification is already deleted' });
    }
    notification.isDeleted = true;

    const updatedNotification = await notification.save();

    res.status(200).json(updatedNotification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
