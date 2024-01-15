const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Plan = require('../models/PlanSchema')
const Contest = require('../models/ContestSchema');

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

module.exports = router;