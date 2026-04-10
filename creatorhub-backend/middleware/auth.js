// middleware/auth.js
// ─────────────────────────────────────────────
//  Verifies the JWT token on protected routes.
//  Usage: router.get('/me', protect, handler)
// ─────────────────────────────────────────────

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware — verifies Bearer token.
 * On success, attaches req.user = { id, name, email, role }
 */
const protect = (req, res, next) => {
  try {
    // 1. Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Confirm user still exists and is active
    const user = User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    // 4. Attach user to request object
    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Role guard — use after protect.
 * Example: restrictTo('admin', 'creator')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`
    });
  }
  next();
};

module.exports = { protect, restrictTo };
