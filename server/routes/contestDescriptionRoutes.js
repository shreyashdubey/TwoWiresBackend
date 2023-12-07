const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Contest = require('../models/ContestSchema');
const ContestDescription = require('../models/ContestDescriptionSchema');

// Create contest description 
router.post('/create-contest-description',
[
  check('admin').isMongoId().withMessage('Invalid user ID'),
  check('contestId').isMongoId().withMessage('Invalid contest ID'),
  check('subtitle').notEmpty().withMessage('Subtitle is required'),
  check('evaluation').notEmpty().withMessage('Evaluation is required'),
  check('timeline').notEmpty().withMessage('timeline is required'),
  check('overview').notEmpty().withMessage('overview is required'),
  check('description').notEmpty().withMessage('description is required'),
  check('tags').notEmpty().withMessage('tags are required'),
],
async (req, res) => {
  try {
    const {admin, contestId, subtitle, evaluation, timeline, overview, description, tags} = req.body;
    const user = await User.findById(admin);
    if (!user) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    if (!contest.contestCreator.includes(admin)) {
      return res.status(400).json({ error: 'Only contest creators can add description to contest' });
    }
    
    const contestDescription = new ContestDescription(
      {contest,
      subtitle,
      evaluation,
      timeline,
      overview,
      description,
      tags,}
      )
      
      await contestDescription.save();
      console.log("got contest")
      contest.contestDescription = contestDescription._id;
      await contest.save();
      
    res.status(201).json({ message: 'Contest description created successfully', success: true, contestDescription: contestDescription });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST route to add contestCreator to a contest
router.post('/add-contest-creator/:contestId', async (req, res) => {
    try {
      const { contestId } = req.params;
      const { userIdToAdd, admin } = req.body;
  
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }
      if(contest.isPublished){
        return res.status(400).json({ error: 'You cannot add creators after publishing the contest'});
      }
      const userToAdd = await User.findById(userIdToAdd);
      if (!userToAdd) {
        return res.status(404).json({ error: 'UserToAdd not found' });
      }

      if (!contest.contestCreator.includes(admin)) {
        return res.status(400).json({ error: 'Only contest creators can add user to creator list' });
      }
  
      if (contest.contestCreator.includes(userIdToAdd)) {
        return res.status(400).json({ error: 'User is already a contestCreator for this contest' });
      }
  
      // Add the user as a contestCreator
      contest.contestCreator.push(userIdToAdd);
      await contest.save();
      
      userToAdd.authouredContests.push(contest._id);
      await userToAdd.save();

      res.status(200).json({ message: 'User added as a Contest Creator successfully', success: true, contest });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
// Delete contest
router.delete('/delete-contest/:contestId/:adminId', async (req, res) => {
    const { contestId, adminId } = req.params;
    try {
      // Check if the education entry exists
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ errors: [{ msg: 'Contest not found' }] });
      }

      if (!contest.contestCreator.includes(adminId)) {
        return res.status(400).json({ error: 'Only contest creators can delete the Contest' });
      }

      contest.isDeleted = true;
      await contest.save();

      const user = await  User.findByIdAndUpdate(adminId, { $pull: { authouredContests: contest._id } });  
  
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      res.status(200).json({ message: 'Contest deleted successfully', success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  });

module.exports = router;
