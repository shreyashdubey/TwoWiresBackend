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

      const existingInvite = await Invite.findOne({
        sender: senderUser,
        reciever: recieverUser,
        team: teamExists,
      });
  
      if (existingInvite && existingInvite.didExpire == false) {
        return res.status(400).json({ error: 'Invitation already exists' });
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
        

        // Check if the receiver is not already a member of the team
        const isReceiverAlreadyMember = teamExists.members.some(
          (member) => member.user.toString() === receiverUser._id.toString()
        );

        if (!isReceiverAlreadyMember) {
          // Add receiverUser as a member to the team
          teamExists.members.push({
            user: receiverUser._id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          });
        }

        updatedInvite.isAccepted = true
        const savedInvite = await updatedInvite.save();

        // Update the team document with the new member
        await teamExists.save();        

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

router.get('/get/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const userExists = await User.findById(userId);
      if(!userExists){
        res.status(404),json({error: "User not found"});
      }      

      const unreadNotifications = await Notification.find({
        user: userExists,
        isRead: false,
      })
      res.status(200).json(unreadNotifications);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

module.exports = router;