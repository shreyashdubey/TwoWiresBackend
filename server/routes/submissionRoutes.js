const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Contest = require('../models/ContestSchema');
const ContestDescription = require('../models/ContestDescriptionSchema');
const Submission = require('../models/SubmissionSchema');
// Create contest description 
router.post('/create-submission',
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