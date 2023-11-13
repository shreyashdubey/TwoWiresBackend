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
const Team = require('../models/TeamSchema')
const TeamInviteStatus = require('../enums/TeamInviteStatus');
// Create a new team
router.post('/create', async (req, res) => {
  try {
    const { owner, teamName} = req.body;
    const userExists = await User.findById(owner);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(' presaved team')
    const newTeam = new Team({
      owner,
      teamName,
      members: [{ user: owner, username: userExists.username, inviteStatus: TeamInviteStatus.ACCEPTED }],
    });
    console.log('saved team')
    const savedTeam = await newTeam.save();
    
    // Update the owner's user document to add the team ID if it doesn't already exist
    const updatedUser = await User.findOneAndUpdate(
      { _id: owner, 'teams': { $ne: savedTeam._id } }, // Check if team ID doesn't exist in the user's 'teams' array
      { $addToSet: { teams: savedTeam._id } }, // Add team ID to 'teams' array
      { new: true }
    );
    
    res.status(201).json(savedTeam);
  } catch (err) {
    if (err.code === 11000) { // Catch the duplicate key error
         return res.status(400).json({ error: 'Team name is already in use.' });
    } 
    res.status(400).json({ error: err.message });
  }
});

// Updating the saved teamId, you can edit the teamName and delete the current members
router.put('/update/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { owner, teamName, membersToDelete} = req.body;

    const updatedTeam = await Team.findById(teamId);

    if (!updatedTeam || updatedTeam.isDeleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (updatedTeam.owner.toString() !== owner.toString()) {
      return res.status(403).json({ error: 'Only the owner can update the team' });
    }

    // Update teamName if provided
    if (teamName) {
      updatedTeam.teamName = teamName;
    }
    updatedTeam.updatedAt = new Date();

     // Mark specified members as isDeleted=true
     if (membersToDelete && Array.isArray(membersToDelete)) {
      const usersToUpdate = []; // To keep track of user IDs to update

      updatedTeam.members.forEach((member) => {
        if (membersToDelete.includes(member.user.toString()) && member.user.toString() !== updatedTeam.owner.toString()) {
          member.isDeleted = true;
          usersToUpdate.push(member.user);
        }
      });

      // Update the user documents to remove the team ID
      await User.updateMany(
        { _id: { $in: usersToUpdate } },
        { $pull: { teams: updatedTeam._id } }
      );
    }

    const savedTeam = await updatedTeam.save();

    res.status(200).json(savedTeam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete team by id
router.put('/delete/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { owner} = req.body;

    const updatedTeam = await Team.findById(teamId);

    if (!updatedTeam || updatedTeam.isDeleted) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (updatedTeam.owner.toString() !== owner.toString()) {
      return res.status(403).json({ error: 'Only the owner can delete the team' });
    }

    updatedTeam.isDeleted = true;
    updatedTeam.updatedAt = new Date();
    const savedTeam = await updatedTeam.save();
    res.status(200).json(savedTeam);

     // Get the list of member user IDs
     const memberUserIds = updatedTeam.members
     .filter((member) => !member.isDeleted)
     .map((member) => member.user);

   // Remove the team ID from the 'teams' array of all members
   await User.updateMany(
     { _id: { $in: memberUserIds } },
     { $pull: { teams: teamId } }
   );

    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Get all teams for a user
router.get('/all', async (req, res) => {
  try {
    const { owner, page, pageSize } = req.query;

    // Check if the user exists
    const userExists = await User.findById(owner);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  
      pageSize: parseInt(pageSize, 10) || 10, 
    };
    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const teams = await Team.find({ owner: owner })
      .skip(skip)
      .limit(pageOptions.pageSize);

    const totalTeams = await Team.countDocuments({ owner: owner });

    const totalPages = Math.ceil(totalTeams / pageOptions.pageSize);

    res.status(200).json({
      teams,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalTeams,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get team by ID
router.get('/get/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId)//.populate('members.user');

    if (!team || team.isDeleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
