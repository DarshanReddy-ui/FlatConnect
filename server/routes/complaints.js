const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all complaints (admin) or user's complaints
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    // If not admin, only show user's complaints
    if (req.user.role !== 'admin') {
      query.submittedBy = req.user.userId;
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name apartment')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    // Transform complaints to include submitter info for hardcoded admin view
    const transformedComplaints = complaints.map(complaint => {
      const complaintObj = complaint.toObject();
      if (complaintObj.submittedBy) {
        return complaintObj;
      }
      // Handle cases where submittedBy might not be populated
      return {
        ...complaintObj,
        submittedBy: {
          name: 'Unknown User',
          apartment: complaintObj.apartment || 'Unknown'
        }
      };
    });

    res.json({
      complaints: transformedComplaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name apartment phone')
      .populate('assignedTo', 'name')
      .populate('comments.user', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user can access this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new complaint
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['maintenance', 'security', 'cleanliness', 'noise', 'parking', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority } = req.body;

    // Admins shouldn't submit complaints
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot submit complaints. Please create events instead.' });
    }

    // Get user's apartment from their profile
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'medium',
      submittedBy: req.user.userId,
      apartment: user.apartment
    });

    await complaint.save();
    await complaint.populate('submittedBy', 'name apartment');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (admin only)
router.put('/:id/status', auth, adminAuth, [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, assignedTo } = req.body;
    const updateFields = { status };

    if (assignedTo) updateFields.assignedTo = assignedTo;
    if (status === 'resolved') updateFields.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name apartment')
     .populate('assignedTo', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to complaint
router.post('/:id/comments', auth, [
  body('message').trim().isLength({ min: 1 }).withMessage('Comment message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user can comment on this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    complaint.comments.push({
      user: req.user.userId,
      message
    });

    await complaint.save();
    await complaint.populate('comments.user', 'name');

    res.json({
      message: 'Comment added successfully',
      comment: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint statistics (admin only)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;