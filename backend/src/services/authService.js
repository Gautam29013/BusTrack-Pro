const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register new user with email/password
   */
  async register({ name, email, password }) {
    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, name, email, role, avatar, created_at`,
      [name, email, hashed]
    );

    const user = result.rows[0];
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    // Store refresh token
    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login with email/password
   */
  async login({ email, password }) {
    const result = await query(
      'SELECT id, name, email, password, role, avatar FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.password) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const { password: _, ...safeUser } = user;
    const accessToken = signAccessToken({ id: safeUser.id, role: safeUser.role });
    const refreshToken = signRefreshToken({ id: safeUser.id });

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, safeUser.id]);

    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      const err = new Error('Invalid refresh token');
      err.statusCode = 401;
      throw err;
    }

    const result = await query(
      'SELECT id, role, refresh_token FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user || user.refresh_token !== token) {
      const err = new Error('Refresh token revoked');
      err.statusCode = 401;
      throw err;
    }

    const newAccessToken = signAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user.id });

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — invalidate refresh token
   */
  async logout(userId) {
    await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
  }

  /**
   * Upsert Google OAuth user
   */
  async googleOAuth({ googleId, email, name, avatar }) {
    let result = await query('SELECT id, name, email, role, avatar FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
    let user = result.rows[0];

    if (!user) {
      result = await query(
        `INSERT INTO users (name, email, google_id, avatar, is_verified)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, email, role, avatar`,
        [name, email, googleId, avatar]
      );
      user = result.rows[0];
    } else if (!user.google_id) {
      await query('UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3', [googleId, avatar, user.id]);
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    return { user, accessToken, refreshToken };
  }
}

module.exports = new AuthService();
