const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User'); // Ensure this model file exists
const protect = require('../middleware/auth'); // Import auth middleware


// POST /api/users/signup
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });


    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });


    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/users/login
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });


    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, fullname: user.fullname },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );


    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: { email: user.email, fullname: user.fullname } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/users/profile - get logged-in user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
