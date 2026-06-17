const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Block registering with admin email
    if (email.trim().toLowerCase() === 'm@admin.com') {
      return res.status(400).json({ error: 'Registration not allowed for this email' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        uid: user._id.toString(),
        name: user.name,
        displayName: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password').populate('enrolledCourses');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        uid: user._id.toString(),
        name: user.name,
        displayName: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: (user.enrolledCourses || []).map((c) => {
          const obj = c.toObject ? c.toObject() : c;
          obj.id = obj._id.toString();
          return obj;
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me — Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mappedCourses = (user.enrolledCourses || []).map((c) => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        uid: user._id.toString(),
        name: user.name,
        displayName: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: mappedCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile — Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.name) {
      user.name = req.body.name;
    }
    
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        uid: user._id.toString(),
        name: user.name,
        displayName: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
