const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, cookieOptions);

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'email or password invalid' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.cookie('auth-token', token, cookieOptions);

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      user: userWithoutPassword,
      auth: { expiresIn: '24h', type: 'Bearer' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/remember-me', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  res.cookie('rememberedEmail', email, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  
  res.json({ message: 'Remember me set successfully' });
});

router.post('/clear-remember-me', (req, res) => {
  res.clearCookie('rememberedEmail');
  res.json({ message: 'Remember me cleared successfully' });
});

router.get('/check-remember-me', (req, res) => {
  try {
    const rememberedEmail = req.cookies.rememberedEmail;
    res.json({ email: rememberedEmail || null });
  } catch (error) {
    console.error('Check remember-me error:', error);
    res.status(500).json({ error: 'Failed to check remembered user' });
  }
});

router.post('/logout', verifyToken, (req, res) => {
  const clearCookieOptions = {
    ...cookieOptions,
    expires: new Date(0)
  };

  res.cookie('auth-token', '', clearCookieOptions);
  res.cookie('token', '', clearCookieOptions);
  res.cookie('rememberedEmail', '', clearCookieOptions);

  res.json({ message: 'Logged out successfully', auth: null });
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'email or password invalid' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

router.get('/verify-auth', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'email or password invalid' });
    }

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({ isAuthenticated: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying authentication' });
  }
});

module.exports = router;