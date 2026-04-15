const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, ownerOrAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true };

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;

    const events = await Event.find(query)
      .populate('organizer', 'name')
      .populate('attendees.user', 'name apartment')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name apartment')
      .populate('attendees.user', 'name apartment');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event (admin/owner only)
router.post('/', auth, ownerOrAdminAuth, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time (HH:MM)'),
  body('category').optional().isIn(['meeting', 'social', 'maintenance', 'emergency', 'celebration', 'other']).withMessage('Invalid category'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, time, location, category, maxAttendees, isPublic } = req.body;

    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      location,
      category: category || 'other',
      maxAttendees,
      isPublic: isPublic !== false,
      organizer: req.user.userId
    });

    await event.save();
    await event.populate('organizer', 'name');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (organizer or admin only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time (HH:MM)'),
  body('category').optional().isIn(['meeting', 'social', 'maintenance', 'emergency', 'celebration', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user can update this event
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['title', 'description', 'date', 'time', 'location', 'category', 'maxAttendees', 'isPublic', 'status'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (updateFields.date) {
      updateFields.date = new Date(updateFields.date);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('organizer', 'name');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/:id/register', auth, [
  body('status').optional().isIn(['attending', 'maybe', 'not-attending']).withMessage('Invalid attendance status')
], async (req, res) => {
  try {
    const { status = 'attending' } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees && status === 'attending') {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const existingAttendee = event.attendees.find(
      attendee => attendee.user.toString() === req.user.userId
    );

    if (existingAttendee) {
      existingAttendee.status = status;
    } else {
      event.attendees.push({
        user: req.user.userId,
        status
      });
    }

    await event.save();
    await event.populate('attendees.user', 'name apartment');

    res.json({
      message: 'Registration updated successfully',
      attendee: event.attendees.find(a => a.user._id.toString() === req.user.userId)
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from event
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.user.userId
    );

    await event.save();

    res.json({ message: 'Unregistered from event successfully' });
  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (organizer or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user can delete this event
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming/list', auth, async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming',
      isPublic: true
    })
    .populate('organizer', 'name')
    .sort({ date: 1 })
    .limit(5);

    res.json({ events });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;