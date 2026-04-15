const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const createDemoUser = (email) => {
  if (email === 'admin@demo.com') {
    return {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      apartment: 'Admin Office',
      role: 'admin',
      phone: '+91-9876543210',
      isActive: true,
      profileImage: ''
    };
  }

  if (email === 'resident@demo.com') {
    return {
      name: 'Demo Resident',
      email: 'resident@demo.com',
      apartment: 'A-101',
      role: 'resident',
      phone: '+91-9876543211',
      isActive: true,
      profileImage: ''
    };
  }

  return null;
};

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('apartment').trim().isLength({ min: 1 }).withMessage('Apartment number is required'),
  body('role').isIn(['resident', 'owner', 'admin', 'maintenance', 'security']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, apartment, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      apartment,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    let user;
    const demoUserFallback = createDemoUser(email);
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      user = await User.findOne({ email });

      // Handle demo accounts auto-creation
      if (!user && password === 'demo123') {
        if (demoUserFallback) {
          user = new User({
            ...demoUserFallback,
            password: 'demo123'
          });
          await user.save();
        }
      }
    }

    if (!user && demoUserFallback && password === 'demo123') {
      user = { ...demoUserFallback, _id: demoUserFallback.email };
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Verify password
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      // If MongoDB is unavailable, allow demo users with the fallback password.
      isMatch = demoUserFallback && password === 'demo123';
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('apartment').optional().trim().isLength({ min: 1 }).withMessage('Apartment number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, apartment } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (apartment) updateFields.apartment = apartment;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    // In a real app we'd generate a reset token and trigger an email here
    res.json({ message: 'If an account exists with this email, a reset link will be sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

module.exports = router;