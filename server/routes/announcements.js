const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { auth, ownerOrAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const { category, priority, page = 1, limit = 10 } = req.query;
    const query = { 
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role }
      ]
    };

    // Apply filters
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Filter out expired announcements
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];

    const announcements = await Announcement.find(query)
      .populate('author', 'name role')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single announcement
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name role apartment')
      .populate('readBy.user', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can access this announcement
    if (announcement.targetAudience !== 'all' && announcement.targetAudience !== req.user.role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read by current user
    const alreadyRead = announcement.readBy.find(
      read => read.user._id.toString() === req.user.userId
    );

    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user.userId });
      await announcement.save();
    }

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new announcement (admin/owner only)
router.post('/', auth, ownerOrAdminAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').optional().isIn(['general', 'maintenance', 'security', 'emergency', 'event', 'policy']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetAudience').optional().isIn(['all', 'residents', 'owners', 'maintenance', 'security']).withMessage('Invalid target audience'),
  body('expiresAt').optional().isISO8601().withMessage('Please provide a valid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, priority, targetAudience, expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      author: req.user.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await announcement.save();
    await announcement.populate('author', 'name role');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement (author or admin only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content').optional().trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').optional().isIn(['general', 'maintenance', 'security', 'emergency', 'event', 'policy']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetAudience').optional().isIn(['all', 'residents', 'owners', 'maintenance', 'security']).withMessage('Invalid target audience'),
  body('expiresAt').optional().isISO8601().withMessage('Please provide a valid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can update this announcement
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['title', 'content', 'category', 'priority', 'targetAudience', 'expiresAt', 'isActive'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (updateFields.expiresAt) {
      updateFields.expiresAt = new Date(updateFields.expiresAt);
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'name role');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement (author or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can delete this announcement
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark announcement as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if already marked as read
    const alreadyRead = announcement.readBy.find(
      read => read.user.toString() === req.user.userId
    );

    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user.userId });
      await announcement.save();
    }

    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    console.error('Mark announcement as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent announcements
router.get('/recent/list', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role }
      ],
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('author', 'name role')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({ announcements });
  } catch (error) {
    console.error('Get recent announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;