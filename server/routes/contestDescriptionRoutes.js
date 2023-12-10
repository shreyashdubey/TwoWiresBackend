const express = require('express');
const router = express.Router();
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Team = require('../models/TeamSchema')
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

// Edit contest description route
router.put('/edit-contest-description/:contestId', async (req, res) => {
  try {
    const { contestId } = req.params;
    const { subtitle, overview, description, evaluation, timeline, tags } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    if(contest.isPublished){
      return res.status(400).json({ error: 'published contest cannot be edited' });
    }
    

    const existingContestDescription = await ContestDescription.findById(contest.contestDescription);

    if (!existingContestDescription) {
      return res.status(404).json({ error: `Contest description with ID ${contestId} not found` });
    }
    
    existingContestDescription.subtitle = subtitle || existingContestDescription.subtitle;
    existingContestDescription.overview = overview || existingContestDescription.overview;
    existingContestDescription.description = description || existingContestDescription.description;
    existingContestDescription.evaluation = evaluation || existingContestDescription.evaluation;
    existingContestDescription.timeline = timeline || existingContestDescription.timeline;
    existingContestDescription.tags = tags || existingContestDescription.tags;

    // Save the updated contest description
    const updatedContestDescription = await existingContestDescription.save();

    res.status(200).json({ success: true, message: 'Contest description updated successfully', contestDescription: updatedContestDescription });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete contest description route
router.delete('/delete-contest-description/:contestId', async (req, res) => {
  try {
    const { contestId } = req.params;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    if(contest.isPublished){
      return res.status(400).json({ error: `Contest description cannot be deleted after publishing.` });
    }
    // Check if the contest description with the provided ID exists
    const existingContestDescription = await ContestDescription.findById(contest.contestDescription);

    if (!existingContestDescription) {
      return res.status(404).json({ error: `Contest description with ID ${contestId} not found` });
    }

    existingContestDescription.isDeleted = true;
    contest.contestDescription = null;
    await existingContestDescription.save();
    await contest.save();

    res.status(200).json({ success: true, message: 'Contest description deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contest description for given contest
router.get('/get-contest-description/:contestId', async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    const contestDescription = await ContestDescription.findById(contest.contestDescription);

    if (!contestDescription || contestDescription.isDeleted) {
      return res.status(404).json({ error: `Contest description with ID ${contestId} not found` });
    }

    res.status(200).json({ success: true, contestDescription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add participant to a contest
router.post('/add-participant/:contestId', async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userId, teamId } = req.body;

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
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if(!contest.contestDescription){
      return res.status(404).json({ error: 'Contest Description not found' });
    }

    // Find the contest description by contestId
    const contestDescription = await ContestDescription.findById(contest.contestDescription);

    // Check if the contest description exists
    if (!contestDescription) {
      return res.status(404).json({ error: 'Contest description not found' });
    }

    // Check if the user or team is already a participant
    const isUserAlreadyParticipant = contestDescription.participants.some(participant => participant.user?.toString() === userId);
    const isTeamAlreadyParticipant = contestDescription.participants.some(participant => participant.team?.toString() === teamId);

    if (isUserAlreadyParticipant || isTeamAlreadyParticipant) {
      return res.status(400).json({ error: 'User or team is already a participant' });
    }

    // Add the user or team to the participants array
    if (userId) {
      contestDescription.participants.push({ user: userId });
    } else {
      contestDescription.participants.push({ team: teamId });
    }

    // Save the updated contest description
    await contestDescription.save();

    res.status(200).json({ message: 'Participant added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
