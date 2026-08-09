const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware: authenticate Socket.io connections via JWT in handshake
 */
function socketAuth(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    // Allow unauthenticated connections for public tracking
    socket.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    socket.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Socket auth failed: ${err.message}`);
    socket.user = null;
    next(); // Don't block — public pages can still view
  }
}

module.exports = socketAuth;
