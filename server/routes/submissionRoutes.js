const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Team = require('../models/TeamSchema');
const Contest = require('../models/ContestSchema');
const ContestDescription = require('../models/ContestDescriptionSchema');
const Submission = require('../models/SubmissionSchema');


// Create a submission 

router.post('/create-submissions', async (req, res) => {
  try {
    const { contestId, userId, teamId, data } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: `Contest not found` });
    }

    const contestDescription = await ContestDescription.findById(contest.contestDescription)
    if (!contestDescription) {
      return res.status(404).json({ error: `Contest Description found` });
    }
    if ((!userId && !teamId) || (userId && teamId)) {
      return res.status(400).json({ error: 'Provide either userId or teamId' });
    }
    if(userId){
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ error: 'User to add as participant not found' });
      }
    }
    if(teamId){
      const teamExists = await Team.findById(teamId);
      if (!teamExists || teamExists.isDeleted) {
        return res.status(404).json({ error: 'Team not found' });
      }
    }
    // Create a new submission instance
    const newSubmission = new Submission({
      contest: contestId,
      participant: {
        user: userId,
        team: teamId,
      },
      data,
    });

    // Save the submission to the database
    const savedSubmission = await newSubmission.save();

    res.status(201).json(savedSubmission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all submissions for a contest with pagination
router.get('/get-submissions', async (req, res) => {
  try {
    const { contestId, page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    // Fetch submissions for the specified contest with pagination from the database
    const submissions = await Submission.find({ contest: contestId, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize)
      .populate('participant.user', 'username') // Populate the user field with details if needed
      .populate('participant.team', 'teamName'); // Populate the team field with details if needed

    const totalSubmissions = await Submission.countDocuments({ contest: contestId, isDeleted: false });

    const totalPages = Math.ceil(totalSubmissions / pageOptions.pageSize);

    res.status(200).json({
      submissions,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalSubmissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;