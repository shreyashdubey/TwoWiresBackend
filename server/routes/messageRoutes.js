const express = require('express');
const router = express.Router();
const Message = require('../models/MessageSchema')
const User = require('../models/UserSchema')
// Create a new message
router.post('/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific message by ID
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a message by ID
router.put('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message by ID
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndRemove(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;