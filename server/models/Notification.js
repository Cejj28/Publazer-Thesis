const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true }, // ID of the user receiving the alert
  message: { type: String, required: true },     // "Your paper was approved"
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  link: { type: String },                        // Where clicking takes them (e.g., "/my-submissions")
  read: { type: Boolean, default: false },       // Has the user seen it?
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);