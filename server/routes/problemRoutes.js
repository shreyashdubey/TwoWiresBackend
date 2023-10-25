const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Problem = require('../models/ProblemSchema');
const InputOutput = require('../models/InputOutputSchema');
const Prompt = require('../models/PromptSchema');
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

    if(aiOption.length == 0){
        return res.status(404).json({ error: 'AI option not selected'});
    }

    const newProblem = new Problem({
      user,
      problemName,
      aiOption,
    });

    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
    console.log("Post saved hurray!!")
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updating the saved problem name.
router.put('/update/:problemID', async (req, res) => {
  try {
    const problemID = req.params.problemID;
    const { user, problemName} = req.body;

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the problem by ID
    const problem = await Problem.findById(problemID);

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
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
});

// Get a problem by ID
router.get('/:problemID', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemID);
    
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
