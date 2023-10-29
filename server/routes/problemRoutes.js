const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Problem = require('../models/ProblemSchema');
const AiOptions = require('../enums/AiOptions');
// Create a new post
router.post('/create', async (req, res) => {
  try {
    const { user, problemName, aiOption} = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(problemName.length == 0){
        return res.status(404).json({ error: 'Problem name not given' });
    }

    // Check if the sender is a valid option
    if (!Object.values(AiOptions).includes(aiOption.trim())) {
      return res.status(400).json({ error: 'Invalid ai option.' });
    }
    const newProblem = new Problem({
      user,
      problemName,
      aiOption,
    });

    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updating the saved problem name.
router.put('/update/:problemId', async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const { user, problemName} = req.body;

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    problem.problemName = problemName
    problem.updatedAt = new Date();
    const updatedProblem = await problem.save();

    res.status(200).json(updatedProblem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all problems
router.get('/all', async (req, res) => {
  try {
    const { user, page, pageSize } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageOptions = {
      page: parseInt(page, 10) || 1,  // Current page (default to 1)
      pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
    };

    const skip = (pageOptions.page - 1) * pageOptions.pageSize;

    const problems = await Problem.find({ user: user })
      .skip(skip)
      .limit(pageOptions.pageSize);

    const totalProblems = await Problem.countDocuments({ user: user});

    const totalPages = Math.ceil(totalProblems / pageOptions.pageSize);

    res.status(200).json({
      problems,
      page: pageOptions.page,
      pageSize: pageOptions.pageSize,
      totalPages,
      totalProblems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a problem by ID
router.get('/:problemID', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemID);
    const { user} = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a problem by ID
router.put('/delete/:problemID', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemID);
    
    if (!problem) {
      return res.status(404).json({ error: 'problem not found' });
    }
    
    if(problem.isDeleted){
      return res.status(404).json({ error: 'problem is already deleted' });
    }
    problem.isDeleted = true;
    problem.updatedAt = new Date()

    const updatedProblem = await problem.save();

    res.status(200).json(updatedProblem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
