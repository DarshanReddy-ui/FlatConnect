const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['maintenance', 'security', 'cleanliness', 'noise', 'parking', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  apartment: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: {
    type: Date
  },
  estimatedResolution: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ submittedBy: 1, status: 1 });
complaintSchema.index({ apartment: 1, status: 1 });
complaintSchema.index({ category: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);