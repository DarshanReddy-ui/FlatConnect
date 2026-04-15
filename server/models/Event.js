const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['meeting', 'social', 'maintenance', 'emergency', 'celebration', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['attending', 'maybe', 'not-attending'],
      default: 'attending'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);