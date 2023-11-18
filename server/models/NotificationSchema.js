const mongoose = require('mongoose');
const NotificationTypes = require('../enums/NotificationTypes');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  notificationType: {type: String, enum: NotificationTypes, required: true},
  sourceId: {type: mongoose.Schema.Types.ObjectId, required: true},
  isRead: {type: Boolean, required: true},
  isDeleted: {type: Boolean, required: true},
  createdAt: {type: Date, default: Date.now,},
  updatedAt: {type: Date, default: Date.now,},
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
