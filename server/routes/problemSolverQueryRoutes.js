const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const User = require('../models/UserSchema');
const Problem = require('../models/ProblemSchema');
const ProblemSolverQuery = require('../models/ProblemSolverQuerySchema');
const Prompt = require('../models/PromptSchema');
const SenderOptions = require('../enums/SenderOptions');
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

     // Check if the sender is a valid option
     if (!Object.values(SenderOptions).includes(sender.trim())) {
        return res.status(400).json({ error: 'Invalid sender option.' });
     }

      let path;
      if (parentQueryId) {
        const parentQuery = await ProblemSolverQuery.findById(parentQueryId);
        if (!parentQuery) {
          return res.status(404).json({ error: 'Parent query not found.' });
        }
        path = `${parentQuery.path}/${parentQuery._id}`;
      } else {
        path = " ";
      }

      const newQuery = new ProblemSolverQuery({
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
      const queryExists = await ProblemSolverQuery.findById(queryId);
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
    const { user, page, pageSize} = req.query;
    try {
    
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json({ error: 'User not found.' }); // ye 404 chl nhi rha tha
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      
      const pageOptions = {
        page: parseInt(page, 10) || 1,  // Current page (default to 1)
        pageSize: parseInt(pageSize, 10) || 10, // Number of items per page (default to 10)
      };
      const skip = (pageOptions.page - 1) * pageOptions.pageSize;

      const queries = await ProblemSolverQuery.find({ problem: problem })
      .sort('path')
      .skip(skip)
      .limit(pageOptions.pageSize);

      const totalQueries = await ProblemSolverQuery.countDocuments({ problem: problem});
      
      const totalPages = Math.ceil(totalQueries / pageOptions.pageSize);
  
      res.status(200).json({
        queries,
        page: pageOptions.page,
        pageSize: pageOptions.pageSize,
        totalPages,
        totalQueries,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch queries.' });
    }
  });
  

  // Getting Replies to a specific query. Path conversion - { $regex: `^${parentComment.path}/${commentId}` }
  router.get('/query/:queryId', async (req, res) => {
    const queryId = req.params.queryId;
  
    try {
      const parentQuery = await ProblemSolverQuery.findById(queryId);
      if (!parentQuery) {
        return res.status(404).json({ error: 'Parent query not found.' });
      }
  
      const queries = await ProblemSolverQuery.find({
        path: { $regex: `^${parentQuery.path}/${queryId}` },
      });
  
      res.json(queries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch replies.' });
    }
  });
  
  
  module.exports = router;