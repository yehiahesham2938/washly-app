const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }
  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authRequired };
