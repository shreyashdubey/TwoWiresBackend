const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Plan = require('../models/PlanSchema')
const Contest = require('../models/ContestSchema');
const NotificationTypes = require('../enums/NotificationTypes');
const Notification = require('../models/NotificationSchema');

// POST route to create a plan for a given contest
router.post('/plan', async (req, res) => {
  const { contestId, userId } = req.query;
  const { planName, planDescription } = req.body; // Assuming the plan data is sent in the request body
  try {
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPlan = new Plan({
      planName,
      planDescription,
      planCreator: userId,
      contest
    });

    const savedPlan = await newPlan.save();

    contest.plans.push(savedPlan._id);
    await contest.save();

    res.status(201).json({ message: 'Plan created successfully', plan: savedPlan });
  } catch (error) {
    console.error('Error creating plan:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/plan', async (req, res) => {
  try {

    const { planId, planName, planCreator, planDescription, isSubmitted } = req.body;

    const existingPlan = await Plan.findById(planId);

    if (!existingPlan) {
      return res.status(404).json({ error: `Plan with ID ${planId} not found` });
    }

    if (isSubmitted) {
      if (existingPlan.isSubmitted) {
        return res.status(400).json({ error: 'Plan already submitted' });
      } else if (existingPlan.executionSteps.length > 0) {
        return res.status(400).json({ error: 'No Execution steps found' });
      }
      else {
        existingPlan.isSubmitted = true;

        const notification = new Notification({
          user: existingPlan.planCreator,
          notificationType: NotificationTypes.PLAN_SUBMITTED_FOR_REVIEW,
          sourceId: existingPlan,
          isRead: false,
          isDeleted: false,
        });

        await notification.save();
      }
    }

    // Update the plan fields
    existingPlan.planName = planName || existingPlan.planName;
    existingPlan.planDescription = planDescription || existingPlan.planDescription;

    // Save the updated plan
    const updatedPlan = await existingPlan.save();

    res.status(200).json({ success: true, message: 'Plan updated successfully', plan: updatedPlan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/plan', async (req, res) => {
  try {
    const { contestId, page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    // Check if the contest exists
    const contestExists = await Contest.findById(contestId);
    if (!contestExists) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const plans = await Plan.find({ contest: contestId, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize)
      .populate('planCreator', 'username') // Assuming 'username' is a field in your User model
    //.populate('executionSteps', 'stepDescription'); // Assuming 'stepDescription' is a field in your ExecutionStepsSchema

    const totalPlans = await Plan.countDocuments({ contest: contestId, isDeleted: false });

    const totalPages = Math.ceil(totalPlans / pageOptions.pageSize);

    res.status(200).json({
      plans,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/plan', async (req, res) => {
  try {
    const { planId } = req.query;
    const existingPlan = await Plan.findById(planId);
    if (!existingPlan) {
      return res.status(404).json({ error: `Plan with ID ${planId} not found` });
    }
    existingPlan.isDeleted = true;
    await existingPlan.save();

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vote-plan', async (req, res) => {
  try {

    const { planId, user, reaction } = req.body;
    const existingPlan = await Plan.findById(planId);

    if (!existingPlan) {
      return res.status(404).json({ error: `Plan with ID ${planId} not found` });
    }
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ error: `User with ID ${user} not found` });
    }
    // Check if the reaction is valid (-1 for downvote, 0 for remove vote, 1 for upvote)
    if (![1, 0, -1].includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction code' });
    }

    // Remove the user from both upVotes and downVotes arrays if the reaction is 0
    if (reaction === 0) {
      existingPlan.upVotes = existingPlan.upVotes.filter((userId) => userId.toString() !== user);
      existingPlan.downVotes = existingPlan.downVotes.filter((userId) => userId.toString() !== user);
    } else if (reaction === 1) {
      // Upvote: Check if the user is not already present in the upVotes array
      if (!existingPlan.upVotes.includes(user)) {
        // Remove the user from the downVotes array if present
        existingPlan.downVotes = existingPlan.downVotes.filter((userId) => userId.toString() !== user);
        // Add the user to the upVotes array
        existingPlan.upVotes.push(user);
      } else {
        return res.status(400).json({ error: 'User already upvoted' });
      }
    } else if (reaction === -1) {
      // Downvote: Check if the user is not already present in the downVotes array
      if (!existingPlan.downVotes.includes(user)) {
        // Remove the user from the upVotes array if present
        existingPlan.upVotes = existingPlan.upVotes.filter((userId) => userId.toString() !== user);
        // Add the user to the downVotes array
        existingPlan.downVotes.push(user);
      } else {
        return res.status(400).json({ error: 'User already downvoted' });
      }
    }

    // Save the updated plan
    await existingPlan.save();

    res.status(200).json({ success: true, message: 'Vote updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;