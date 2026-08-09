const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived)
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

/**
 * Generate refresh token (long-lived)
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
