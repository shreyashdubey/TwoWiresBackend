const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Problem = require('../models/ProblemSchema');
const ProblemSolverQuery = require('../models/ProblemSolverQuerySchema');
const Prompt = require('../models/PromptSchema');
// Create a new prompt list

router.post('/create', async (req, res) => {
  try {
    const { user, problem, queryId, prompts} = req.body;
    
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const problemExists = await Problem.findById(problem);
      if (!problemExists) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const queryExists = await ProblemSolverQuery.findById(queryId);
      if (!queryExists) {
        return res.status(404).json({ error: 'query not found.' });
      } 
    
      const newPrompt = new Prompt({
      user,
      problem,
      queryId,
      prompts,
    });

    const savedPrompt = await newPrompt.save();
    res.status(201).json(savedPrompt);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get a problem by ID
router.get('/:queryID', async (req, res) => {
  try {
    const prompts = await Prompt.find({queryId: req.params.queryID});
    
    if (!prompts) {
      return res.status(404).json({ error: 'prompts not found' });
    }
    
    res.status(200).json(prompts);
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
