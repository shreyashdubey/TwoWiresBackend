const express = require('express');
const router = express.Router();
const Message = require('../models/MessageSchema')
const User = require('../models/UserSchema')


router.get('/last10/:chatId', async (req, res) => {
    const { chatId } = req.params;
  
    try {
      const message = await Message.findOne({ chatId }, { 'messages': { $slice: -10 } })
        .populate('messages.sender', 'username')
        .lean();
  
      if (!message) {
        return res.status(404).json({ error: 'No messages found for the chat' });
      }
  
      const formattedMessages = message.messages.map(msg => {
        const senderUsername = msg.sender.username;
        return `${senderUsername}: ${msg.text}`;
      });
  
      res.json(formattedMessages);
    } catch (error) {
      console.error('Error getting last 10 messages:', error);
      res.status(500).json({ error: 'Failed to get last 10 messages' });
    }
  });
  

  module.exports = router;