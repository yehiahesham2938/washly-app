const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { inferRoleFromEmail } = require('../utils/role');

const router = express.Router();

function jwtSecret() {
  return (process.env.JWT_SECRET || '').trim();
}

function signToken(userId, role) {
  const secret = jwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId, role }, secret, { expiresIn });
}

function formatUser(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const id = o._id ?? o.id;
  return {
    id: id != null ? String(id) : '',
    name: o.name,
    email: o.email,
    phone: o.phone,
    role: o.role,
  };
}

function ensureJwtSecret(res) {
  if (!jwtSecret()) {
    res.status(500).json({ message: 'JWT_SECRET is not configured' });
    return false;
  }
  return true;
}

function isDuplicateKeyError(err) {
  if (!err) return false;
  const c = err.code;
  return c === 11000 || c === '11000' || String(c).includes('11000');
}

/** Non-Error throws in async routes can crash the catch block when reading `.name` / `.code`. */
function normalizeError(raw) {
  if (raw instanceof Error) return raw;
  return new Error(
    typeof raw === 'string' ? raw : `Non-Error rejection: ${String(raw)}`
  );
}

function errorDetail(err) {
  const parts = [
    err.message,
    err.code != null ? `code=${err.code}` : null,
    err.name && err.name !== 'Error' ? err.name : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' | ') : String(err);
}

function validationMessages(err) {
  if (!err || err.name !== 'ValidationError' || !err.errors) return null;
  try {
    return Object.values(err.errors)
      .map((x) => (x && typeof x === 'object' && x.message ? x.message : null))
      .filter(Boolean)
      .join(' ')
      .trim();
  } catch {
    return null;
  }
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

    const token = signToken(user._id.toString(), user.role);
    return res.status(201).json({ user: formatUser(user), token });
  } catch (raw) {
    const e = normalizeError(raw);
    try {
      if (isDuplicateKeyError(e)) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }
      const vmsg = validationMessages(e);
      if (vmsg) {
        return res.status(400).json({ message: vmsg || 'Validation failed' });
      }
    } catch (inner) {
      const innerNorm = normalizeError(inner);
      console.error('POST /register (handler bug)', innerNorm);
      return res.status(500).json({
        message: 'Registration failed',
        detail: errorDetail(innerNorm),
      });
    }
    console.error('POST /register', e);
    return res.status(500).json({
      message: 'Registration failed',
      detail: errorDetail(e),
    });
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

    const token = signToken(user._id.toString(), user.role);
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
