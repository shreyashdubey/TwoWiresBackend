const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const Post = require('../models/PostSchema');
const User = require('../models/UserSchema');
const Invite = require('../models/InviteSchema');
const Notification = require('../models/NotificationSchema')
const Team = require('../models/TeamSchema')
const NotificationTypes = require('../enums/NotificationTypes');
const validateToken = require('../utils/validateToken');
const ReachabilityOptions = require('../enums/ReachabilityOptions');
const CommentControl = require('../enums/CommentControl')

router.post('/create', async (req, res) => {
    try {
      const { sender, team, reciever, } = req.body;
  
      const senderUser = await User.findById(sender);
      const recieverUser = await User.findById(reciever);
  
      if (!senderUser) {
        return res.status(404).json({ error: 'Sender not found' });
      }
      if (!recieverUser) {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      const teamExists = await Team.findById(team);
      if (!teamExists || teamExists.isDeleted) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Create a new invitation
      const newInvite = new Invite({
        sender,
        reciever,
        team,
      });
  
      const savedInvite = await newInvite.save();
      
        // Create a notification for the receiver
        const notification = new Notification({
        user: reciever,
        notificationType: NotificationTypes.TEAM_INVITE, 
        sourceId: savedInvite, 
        isRead: false,
        isDeleted: false,
      });
  
      const savedNotification = await notification.save();

      res.status(201).json(savedInvite);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});

router.put('/accept/:inviteId', async (req, res) => {
    try {
        
        const inviteId = req.params.inviteId;
        const updatedInvite = await Invite.findById(inviteId);
        if(!updatedInvite){
        return res.status(404).json({error: 'Invite not found'});
        }
        const senderUser = await User.findById(updatedInvite.sender);
        const recieverUser = await User.findById(updatedInvite.reciever);

        if (!senderUser) {
        return res.status(404).json({ error: 'Sender not found' });
        }
        if (!recieverUser) {
        return res.status(404).json({ error: 'Receiver not found' });
        }
        const teamExists = await Team.findById(updatedInvite.sourceId);
        if (!teamExists || teamExists.isDeleted) {
        return res.status(404).json({ error: 'Team not found' });
        }
        
        updatedInvite.isAccepted = true
        const savedInvite = await updatedInvite.save();
        
        // Add team id to the User's teamId collection
        const updatedUser = await User.findOneAndUpdate(
            { _id: updatedInvite.reciever, 'teams': { $ne: updatedInvite.sourceId } }, // Check if team ID doesn't exist in the user's 'teams' array
            { $addToSet: { teams: savedTeam._id } }, // Add team ID to 'teams' array
            { new: true }
          );


        // Create a notification for the receiver
        const notification = new Notification({
        user: sender,
        notificationType: NotificationTypes.TEAM_INVITE, 
        sourceId: savedInvite, 
        isRead: false,
        isDeleted: false,
        });
        const savedNotification = await notification.save();

        res.status(201).json(savedInvite);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;