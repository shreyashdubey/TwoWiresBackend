const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Problem = require('../models/ProblemSchema');
const InputOutput = require('../models/InputOutputSchema');
const Prompt = require('../models/PromptSchema');

// Create a new AI query
router.post('/create', async (req, res) => {
    const { user, problem, sender, text, parentQueryId } = req.body;
    try {
      // Check if the user exists
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
      }
  
      const problemExists = await Problem.findById(problem);
      if (!problemExists) {
        return res.status(404).json({ error: 'Problem not found' });
      }

     if(sender.length == 0){
        return res.status(404).json({ error: 'AI option not selected'});
      }

      let path;
      if (parentQueryId) {
        const parentQuery = await InputOutput.findById(parentQueryId);
        if (!parentQuery) {
          return res.status(404).json({ error: 'Parent query not found.' });
        }
        path = `${parentQuery.path}/${parentQuery._id}`;
      } else {
        path = " ";
      }

      const newQuery = new InputOutput({
        user,
        problem,
        sender,
        text,
        path,
      });
      const savedQuery = await newQuery.save();
  
      res.status(201).json(savedQuery);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create a new comment.' });
    }
  });
  // Updating the saved comment
  router.put('/update/:queryId', async(req, res) => {
    const { user, problem, text } = req.body;
    const queryId = req.params.queryId;
    try{
        //Check if the user exists
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
      }
  
      const problemExists = await Problem.findById(problem);
      if (!problemExists) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Check if the comment exist and is not deleted
      const queryExists = await InputOutput.findById(queryId);
      if (!queryExists) {
        return res.status(404).json({ error: 'query not found.' });
      }
      if(queryExists.sender != 'USER'){
        return res.status(404).json({ error: 'Cannot edit AI response' });
      }
      queryExists.text = text
      queryExists.updatedAt = new Date();
      const newQuery = await queryExists.save();
  
      res.status(200).json(newQuery);
    }
    catch(err){
      res.status(500).json({ error: err.message });
    }
  });
  
  // Retrieving comment on a Post in a tree structure, look for the sort('path') function used, TODO- also give logic for UI 
  router.get('/all/:problemId', async (req, res) => {
    const problemId = req.params.problemId;
  
    try {
      const queries = await InputOutput.find({ problem: problemId }).sort('path');
      res.json(queries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch queries.' });
    }
  });
  

  // Getting Replies to a specific query. Path conversion - { $regex: `^${parentComment.path}/${commentId}` }
  router.get('/query/:queryId', async (req, res) => {
    const queryId = req.params.queryId;
  
    try {
      const parentQuery = await InputOutput.findById(queryId);
      if (!parentQuery) {
        return res.status(404).json({ error: 'Parent query not found.' });
      }
  
      const queries = await InputOutput.find({
        path: { $regex: `^${parentQuery.path}/${queryId}` },
      });
  
      res.json(queries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch replies.' });
    }
  });
  
  
  module.exports = router;