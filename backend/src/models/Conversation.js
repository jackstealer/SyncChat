const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  name: {
    type: String,
    trim: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for faster participant queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure at least 2 participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    next(new Error('Conversation must have at least 2 participants'));
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
