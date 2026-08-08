const express = require('express');
const router = express.Router();
const { getAllRoutes, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

// Public can view routes (or users)
router.get('/', getAllRoutes);

// Only admins can modify routes
router.post('/', authenticate, authorize('admin'), createRoute);
router.put('/:id', authenticate, authorize('admin'), updateRoute);
router.delete('/:id', authenticate, authorize('admin'), deleteRoute);

module.exports = router;
