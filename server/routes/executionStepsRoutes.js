const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Plan = require('../models/PlanSchema')
const Contest = require('../models/ContestSchema');
const Execution = require('../models/ExecutionStepsSchema');
const NotificationTypes = require('../enums/NotificationTypes');
const Notification = require('../models/NotificationSchema');

router.post('/execution', async (req, res) => {
  try {
    const { planId, stepNumber, stepName, stepDescription } = req.body;

    const existingPlan = await Plan.findById(planId);

    if (!existingPlan) {
      return res.status(404).json({ error: `Plan with ID ${planId} not found` });
    }

    const newExecutionStep = new Execution({
      stepNumber,
      stepName,
      stepDescription,
      creator: existingPlan.planCreator,
      contest: existingPlan.contest,
      plan: planId,
    });

    const savedExecutionStep = await newExecutionStep.save();
    existingPlan.executionSteps.push(savedExecutionStep._id);
    await existingPlan.save();

    res.status(201).json({ success: true, message: 'Execution step created successfully', executionStep: savedExecutionStep });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/execution', async (req, res) => {
  try {
    const { stepId, stepNumber, stepName, stepDescription } = req.body;
    const existingExecutionStep = await Execution.findById(stepId);
    if (!existingExecutionStep) {
      return res.status(404).json({ error: `Execution step with ID ${stepId} not found` });
    }

    existingExecutionStep.stepNumber = stepNumber || existingExecutionStep.stepNumber;
    existingExecutionStep.stepName = stepName || existingExecutionStep.stepName;
    existingExecutionStep.stepDescription = stepDescription || existingExecutionStep.stepDescription;

    const updatedExecutionStep = await existingExecutionStep.save();

    res.status(200).json({ success: true, message: 'Execution step updated successfully', executionStep: updatedExecutionStep });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/execution', async (req, res) => {
  try {
    const { planId, page, pageSize } = req.query;

    const pageOptions = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 10,
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;
    const existingExecutionSteps = await Execution.find({ plan: planId, isDeleted: false })
      .skip(skip)
      .limit(pageOptions.pageSize);

    if (!existingExecutionSteps.length) {
      return res.status(404).json({ error: `Execution steps for plan with ID ${planId} not found` });
    }

    const totalExecutionSteps = await Execution.countDocuments({ plan: planId, isDeleted: false });

    const totalPages = Math.ceil(totalExecutionSteps / pageOptions.pageSize);

    res.status(200).json({
      success: true,
      executionSteps: existingExecutionSteps,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalExecutionSteps,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/execution', async (req, res) => {
  try {
    const { stepId } = req.query;
    const existingExecutionStep = await Execution.findById(stepId);
    if (!existingExecutionStep) {
      return res.status(404).json({ error: `Execution step with ID ${stepId} not found` });
    }
    existingExecutionStep.isDeleted = true;
    await existingExecutionStep.save();

    res.status(200).json({ success: true, message: 'Execution step deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;