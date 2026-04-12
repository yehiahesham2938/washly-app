const express = require('express');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

function formatUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
  };
}

router.get('/', authRequired, adminOnly, async (req, res) => {
  try {
    const list = await User.find().sort({ createdAt: -1 });
    res.json(list.map((u) => formatUser(u)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

router.patch('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const doc = await User.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'User not found' });
    if (doc.role === 'admin' && role === 'user') {
      return res
        .status(403)
        .json({ message: 'Cannot change an admin to a regular user' });
    }
    if (doc.role === role) {
      return res.json(formatUser(doc));
    }
    doc.role = role;
    await doc.save();
    return res.json(formatUser(doc));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account here' });
    }
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    if (existing.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
