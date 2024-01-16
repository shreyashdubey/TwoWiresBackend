const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Plan = require('../models/PlanSchema')
const Contest = require('../models/ContestSchema');
const NotificationTypes = require('../enums/NotificationTypes');
const DiscussItemTypes = require('../enums/DiscussItemTypes');
const Notification = require('../models/NotificationSchema');
const Execution = require('../models/ExecutionStepsSchema');
const DiscussItem = require('../models/DiscussItemSchema');

router.post('/discuss', async (req, res) => {
    try {
      const { user, text, itemType, planId, executionStepId, parentItemId } = req.body;
  
      // Check if the user with the provided ID exists
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(404).json({ error: `User with ID ${user} not found` });
      }
  
      // Check if the itemType is a valid value
      if (!Object.values(DiscussItemTypes).includes(itemType)) {
        return res.status(400).json({ error: 'Invalid itemType value' });
      }
  
      // Check if the discuss item is a reply to another discuss item
      let path = " ";
      if (parentItemId) {
        const parentItem = await DiscussItem.findById(parentItemId);
        if (!parentItem) {
          return res.status(404).json({ error: `Parent discuss item with ID ${parentItemId} not found` });
        }
        path = parentItem.path ? `${parentItem.path}/${parentItem._id}` : `${parentItem._id}`;
      } else {
        // It's a top-level item
        path = " ";
      }
  
      // Create the discuss item
      const newDiscussItem = new DiscussItem({
        user,
        text,
        itemType,
        path,
      });
  
      // Check if the discuss item is for a plan
      if (planId) {
        const existingPlan = await Plan.findById(planId);
        if (!existingPlan) {
          return res.status(404).json({ error: `Plan with ID ${planId} not found` });
        }
        newDiscussItem.plan = planId;
      }
  
      // Check if the discuss item is for an execution step
      if (executionStepId) {
        const existingExecutionStep = await ExecutionStep.findById(executionStepId);
        if (!existingExecutionStep) {
          return res.status(404).json({ error: `Execution Step with ID ${executionStepId} not found` });
        }
        newDiscussItem.executionStep = executionStepId;
      }
  
      // Save the discuss item
      const savedDiscussItem = await newDiscussItem.save();
  
      res.status(201).json({ success: true, message: 'Discuss item created successfully', discussItem: savedDiscussItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


module.exports = router;