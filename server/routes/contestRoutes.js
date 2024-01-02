const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Contest = require('../models/ContestSchema');
const NotificationTypes = require('../enums/NotificationTypes');
const Notification = require('../models/NotificationSchema');

// Create a new contest
router.post('/create-contest', async (req, res) => {
  try {
    const { contestName, contestOrganizer, contestCreator, startTime, endTime} = req.body;
    const user = await User.findById(contestCreator);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(contestName.length == 0){
        return res.status(404).json({ error: 'Contest name not given' });
    }

    const newContest = new Contest({
      contestName,
      contestOrganizer,
      contestCreator,
      startTime,
      endTime
    });

    const savedContest = await newContest.save();
    
    user.authouredContests.push(savedContest._id);
    await user.save();

    res.status(201).json({ message: 'Contest created successfully', success: true, contest: savedContest });

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
  
// Edit contest route
router.put('/edit-contest/:contestId', async (req, res) => {
  try {
    const { contestName, contestCreator, startTime, endTime, isPublished, prize, isSubmitted } = req.body;
    const { contestId } = req.params;

    // Check if the contest with the provided ID exists
    const existingContest = await Contest.findById(contestId);

    if (!existingContest) {
      return res.status(404).json({ error: `Contest with ID ${contestId} not found` });
    }

    if (contestName && !contestName.trim()) {
      return res.status(400).json({ error: 'Contest name cannot be empty or contain only whitespace' });
    }
    if(isSubmitted){
      if(existingContest.isSubmitted){
        return res.status(400).json({ error: 'Contest already submitted' });
      }
      else{
        existingContest.isSubmitted = true;
        const notification = new Notification({
          user: contestCreator,
          notificationType: NotificationTypes.CONTEST_SUBMITTED_FOR_REVIEW, 
          sourceId: existingContest, 
          isRead: false,
          isDeleted: false,
          });
          await notification.save();
      }
    }
    if(isPublished && existingContest.contestDescription){
      existingContest.isPublished = isPublished || existingContest.isPublished;
    }
    // Update the contest fields
    existingContest.contestName = contestName || existingContest.contestName;
    existingContest.contestOrganizer = contestOrganizer || existingContest.contestOrganizer;
    existingContest.startTime = startTime || existingContest.startTime;
    existingContest.endTime = endTime || existingContest.endTime;
    existingContest.prize = prize || existingContest.prize;

    // Save the updated contest
    const updatedContest = await existingContest.save();

    res.status(200).json({ success: true, message: 'Contest updated successfully', contest: updatedContest });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// Get all contests created by a user
router.get('/get-contests-by-user/:user', async (req, res) => {
  try {
    const { user } = req.params;
    const { page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    // Check if the user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contests = await Contest.find({ contestCreator: user, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize)
      .populate('contestCreator', 'username') // Assuming 'username' is a field in your User model
      .populate('contestDescription', 'description'); // Assuming 'description' is a field in your ContestDescriptionSchema

    const totalContests = await Contest.countDocuments({ contestCreator: user, isDeleted: false });

    const totalPages = Math.ceil(totalContests / pageOptions.pageSize);

    res.status(200).json({
      contests,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalContests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contest by Id
router.get('/get-contest-by-id', async (req, res) => {
  try{
    const { contestId } = req.query;
    const contest = await Contest.findById(contestId);
    if(!contest){
      res.status(404).json({error: 'No contest found with such id'});
    }
    res.status(200).json({success: true, contest: contest });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all contests - sorted by date (desc) and published
router.get('/get-all-contests', async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const contests = await Contest.find({ isDeleted: false, isPublished: true })
      .sort({ createdAt: 'desc' }) // Sort by creation date in descending order
      .skip(skip)
      .limit(pageOptions.pageSize)
      .populate('contestCreator', 'username') // Assuming 'username' is a field in your User model

    const totalContests = await Contest.countDocuments({ isDeleted: false, isPublished: true });

    const totalPages = Math.ceil(totalContests / pageOptions.pageSize);

    res.status(200).json({
      contests,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalContests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/get-all-submitted-contests', async (req, res) => {
  try {
    const { page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const contests = await Contest.find({ isDeleted: false, isPublished: false, isSubmitted: true })
      .sort({ createdAt: 'desc' }) // Sort by creation date in descending order
      .skip(skip)
      .limit(pageOptions.pageSize)
      .populate('contestCreator', 'username') // Assuming 'username' is a field in your User model

    const totalContests = await Contest.countDocuments({ isDeleted: false, isPublished: false });

    const totalPages = Math.ceil(totalContests / pageOptions.pageSize);

    res.status(200).json({
      contests,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalContests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Make contest Under Review
router.put('/review-contest', async (req, res) => {
  try {
    const { contestId } = req.query;
    console.log(contestId)
    // Check if the contest with the provided ID exists
    const existingContest = await Contest.findById(contestId);

    if (!existingContest) {
      return res.status(404).json({ error: `Contest with ID ${contestId} not found` });
    }

    
    if(existingContest.isSubmitted){
      existingContest.isUnderReview = true
      const notification = new Notification({
        user: existingContest.contestCreator[0],
        notificationType: NotificationTypes.CONTEST_UNDER_REVIEW, 
        sourceId: existingContest, 
        isRead: false,
        isDeleted: false,
        sourceContestName: existingContest.contestName,
      });
      await notification.save();
    }
    else{
      res.status(400).json({ error: "Contest is not submitted" });
    }

    // Save the updated contest
    const updatedContest = await existingContest.save();

    res.status(200).json({ success: true, message: 'Contest under review successfully', contest: updatedContest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Publish contest
router.put('/publish-contest', async (req, res) => {
  try {
    const { contestId } = req.query;

    // Check if the contest with the provided ID exists
    const existingContest = await Contest.findById(contestId);

    if (!existingContest) {
      return res.status(404).json({ error: `Contest with ID ${contestId} not found` });
    }

    
    if(existingContest.isSubmitted){
      existingContest.isPublished = true
      const notification = new Notification({
        user: existingContest.contestCreator[0],
        notificationType: NotificationTypes.CONTEST_REVIEW_ACCEPTED, 
        sourceId: existingContest, 
        isRead: false,
        isDeleted: false,
        sourceContestName: existingContest.contestName,
      });
      await notification.save();
    }
    else{
      res.status(400).json({ error: "Contest is not submitted" });
    }

    // Save the updated contest
    const updatedContest = await existingContest.save();

    res.status(200).json({ success: true, message: 'Contest published successfully', contest: updatedContest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
