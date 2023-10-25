const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messages: [
    {
      chatID: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatSchema', required: true},
      payload: { type: String, required: true},
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      reciever: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
      createdAt: {type: String, required: true},
      updatedAt: {type: String, required: true},
      isDelivered: {type: Boolean, required: true},
      deliveredAt: {type: String, required: true},
      isRead: {type: Boolean, required: true},
      readAt: {type: String, required: true},
    },
  ],
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
