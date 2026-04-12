const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { inferRoleFromEmail } = require('../utils/role');

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

function formatUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
  };
}

function ensureJwtSecret(res) {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'JWT_SECRET is not configured' });
    return false;
  }
  return true;
}

/** POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    if (!ensureJwtSecret(res)) return;
    const { name, email, phone, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const role = inferRoleFromEmail(emailNorm);
    const user = await User.create({
      name: String(name).trim(),
      email: emailNorm,
      phone: String(phone).trim(),
      password,
      role,
    });

    const token = signToken(user._id.toString());
    return res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    if (!ensureJwtSecret(res)) return;
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    const plain = user.toObject();
    delete plain.password;
    return res.json({ user: formatUser(user), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

/** GET /api/auth/me */
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: formatUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load user' });
  }
});

module.exports = router;
