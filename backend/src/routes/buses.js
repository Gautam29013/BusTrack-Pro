const express = require('express');
const router = express.Router();
const {
  getAllBuses,
  getBusById,
  getBusLocation,
  getAllBusLocations,
  updateBusLocation,
  getBusRoute,
  searchBuses,
} = require('../controllers/busController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateLocationUpdate } = require('../utils/validators');

router.get('/', getAllBuses);
router.get('/locations', getAllBusLocations);
router.get('/search', searchBuses);
router.get('/:busId', getBusById);
router.get('/:busId/location', getBusLocation);
router.get('/:busId/route', getBusRoute);

// Only drivers and admins can update bus location
router.post(
  '/:busId/location',
  authenticate,
  authorize('driver', 'admin'),
  validateLocationUpdate,
  updateBusLocation
);

module.exports = router;
