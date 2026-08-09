const express = require('express');
const router = express.Router();
const { getAllStops, getStopById, getBusesAtStop, getStopArrivals, createStop } = require('../controllers/stopController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getAllStops);
router.get('/:stopId', getStopById);
router.get('/:stopId/buses', getBusesAtStop);
router.get('/:stopId/arrivals', getStopArrivals);
router.post('/', authenticate, authorize('admin'), createStop);

module.exports = router;
