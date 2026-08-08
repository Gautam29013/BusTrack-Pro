const authService = require('../services/authService');
const logger = require('../utils/logger');

async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const tokens = await authService.refreshToken(token);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({ success: true, data: req.user });
}

async function googleCallback(req, res, next) {
  try {
    const profile = req.user;
    if (!profile) return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`);

    const { user, accessToken, refreshToken } = await authService.googleOAuth(profile);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Redirect to frontend callback page with accessToken so it can be saved in local storage
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/callback?token=${accessToken}`);
  } catch (err) {
    logger.error('Google OAuth callback error', err);
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
}

module.exports = { register, login, refresh, logout, getMe, googleCallback };
