const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
  getJourneyHistory,
  addJourneyHistory
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:routeId', removeFavorite);

router.get('/history', getJourneyHistory);
router.post('/history', addJourneyHistory);

module.exports = router;
