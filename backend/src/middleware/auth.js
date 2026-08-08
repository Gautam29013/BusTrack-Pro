const { verifyAccessToken } = require('../utils/jwt');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Verify JWT and attach user to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const result = await query('SELECT id, name, email, role, avatar FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    logger.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

/**
 * Role-based access guard
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
