const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/analyticsController');
// Uncomment if we want to restrict analytics to authenticated users only:
// const { authenticate } = require('../middleware/auth');

// Using no auth for demo accessibility
router.get('/dashboard', getDashboardData);

module.exports = router;
