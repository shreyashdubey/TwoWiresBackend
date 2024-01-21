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
        const existingUser = await User.findById(user);

        if (!existingUser) {
            return res.status(404).json({ error: `User with ID ${user} not found` });
        }

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
        
        const savedDiscussItem = await newDiscussItem.save();
        res.status(201).json({ success: true, message: 'Discuss item created successfully', discussItem: savedDiscussItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/discuss', async (req, res) => {
  try {
    const { itemId, text } = req.body;
    const existingDiscussItem = await DiscussItem.findById(itemId);
    if (!existingDiscussItem) {
      return res.status(404).json({ error: `Discuss item with ID ${itemId} not found` });
    }

    // Update the text field
    existingDiscussItem.text = text || existingDiscussItem.text;

    // Save the updated discuss item
    const updatedDiscussItem = await existingDiscussItem.save();

    res.status(200).json({ success: true, message: 'Discuss item text updated successfully', discussItem: updatedDiscussItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/discuss', async (req, res) => {
    try {
      const { itemId } = req.body;
  
      // Check if the discuss item with the provided ID exists
      const existingDiscussItem = await DiscussItem.findById(itemId);
      if (!existingDiscussItem) {
        return res.status(404).json({ error: `Discuss item with ID ${itemId} not found` });
      }
      existingDiscussItem.isDeleted = true;
  
      const updatedDiscussItem = await existingDiscussItem.save();
  
      res.status(200).json({ success: true, message: 'deleted successfully', discussItem: updatedDiscussItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;