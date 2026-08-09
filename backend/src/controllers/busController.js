const { query } = require('../config/database');
const locationService = require('../services/locationService');
const etaService = require('../services/etaService');

async function getAllBuses(req, res, next) {
  try {
    const result = await query(
      `SELECT b.id, b.number, b.capacity, b.status, b.is_active,
              r.id as route_id, r.name as route_name, r.number as route_number, r.color
       FROM buses b
       LEFT JOIN routes r ON b.route_id = r.id
       WHERE b.is_active = true
       ORDER BY b.number`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getBusById(req, res, next) {
  try {
    const result = await query(
      `SELECT b.id, b.number, b.capacity, b.status,
              r.id as route_id, r.name as route_name, r.number as route_number, r.color, r.description
       FROM buses b LEFT JOIN routes r ON b.route_id = r.id
       WHERE b.id = $1`,
      [req.params.busId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getBusLocation(req, res, next) {
  try {
    const location = await locationService.getLatestLocation(req.params.busId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'No location data for this bus' });
    }
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

async function getAllBusLocations(req, res, next) {
  try {
    const locations = await locationService.getAllLatestLocations();
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
}

async function updateBusLocation(req, res, next) {
  try {
    const io = req.app.get('io');
    const location = await locationService.updateBusLocation(req.params.busId, req.body, io);
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

async function getBusRoute(req, res, next) {
  try {
    const stops = await etaService.getUpcomingStopsETA(req.params.busId);
    res.json({ success: true, data: stops });
  } catch (err) {
    next(err);
  }
}

async function searchBuses(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const result = await query(
      `SELECT b.id, b.number, r.name as route_name, r.number as route_number
       FROM buses b LEFT JOIN routes r ON b.route_id = r.id
       WHERE b.number ILIKE $1 OR r.name ILIKE $1 OR r.number ILIKE $1
       AND b.is_active = true
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBuses,
  getBusById,
  getBusLocation,
  getAllBusLocations,
  updateBusLocation,
  getBusRoute,
  searchBuses,
};
