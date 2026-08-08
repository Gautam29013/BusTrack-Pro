const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, refresh, logout, getMe, googleCallback } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validateRegister, validateLogin } = require('../utils/validators');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed` }),
  googleCallback
);

module.exports = router;
