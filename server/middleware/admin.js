const User = require('../models/User');

/** Requires authRequired first. Allows admin if JWT role is admin or DB role is admin. */
async function adminOnly(req, res, next) {
  if (req.userRole === 'admin') return next();
  try {
    const u = await User.findById(req.userId).select('role');
    if (u?.role === 'admin') return next();
  } catch {
    // fall through
  }
  return res.status(403).json({ message: 'Admin access required' });
}

module.exports = { adminOnly };
