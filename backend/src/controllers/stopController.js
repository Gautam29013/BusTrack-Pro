const { query } = require('../config/database');
const { calculateETAToStop } = require('../utils/etaEngine');

async function getAllStops(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, latitude, longitude, address FROM stops ORDER BY name'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getStopById(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, latitude, longitude, address FROM stops WHERE id = $1',
      [req.params.stopId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getBusesAtStop(req, res, next) {
  try {
    const result = await query(
      `SELECT b.id, b.number, r.name as route_name, r.color, rs.estimated_minutes
       FROM route_stops rs
       JOIN buses b ON b.route_id = rs.route_id
       JOIN routes r ON r.id = rs.route_id
       WHERE rs.stop_id = $1 AND b.is_active = true AND b.status = 'on_route'
       ORDER BY rs.estimated_minutes`,
      [req.params.stopId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/stops/:stopId/arrivals
 * Returns live ETA for all active buses serving this stop,
 * calculated from their current GPS positions.
 */
async function getStopArrivals(req, res, next) {
  try {
    // Get stop details
    const stopResult = await query(
      'SELECT id, name, latitude, longitude FROM stops WHERE id = $1',
      [req.params.stopId]
    );
    if (!stopResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }
    const stop = stopResult.rows[0];

    // Get all routes that pass through this stop, and their active buses
    const busResult = await query(
      `SELECT b.id, b.number, b.status, r.name as route_name, r.color, r.number as route_number
       FROM route_stops rs
       JOIN routes r ON r.id = rs.route_id
       JOIN buses b ON b.route_id = r.id
       WHERE rs.stop_id = $1 AND b.is_active = true
       ORDER BY r.name`,
      [req.params.stopId]
    );

    // Get live positions from global simulator state (attached to app by server.js)
    const simulatorState = global.busSimulatorState || {};

    const arrivals = busResult.rows.map(bus => {
      const liveState = simulatorState[bus.id];
      let eta_minutes = null;
      let speed = null;
      let crowdLevel = 'unknown';

      if (liveState) {
        speed = liveState.speed;
        const passengerCount = liveState.passengerCount || 0;
        crowdLevel = passengerCount < 15 ? 'empty' : passengerCount < 35 ? 'moderate' : 'full';
        eta_minutes = calculateETAToStop(
          {
            latitude: liveState.latitude,
            longitude: liveState.longitude,
            speed: liveState.speed,
          },
          { latitude: parseFloat(stop.latitude), longitude: parseFloat(stop.longitude) }
        );
      } else {
        // Fallback: random ETA between 2-15 min
        eta_minutes = Math.round(2 + Math.random() * 13);
      }

      return {
        busId: bus.id,
        busNumber: bus.number,
        routeName: bus.route_name,
        routeNumber: bus.route_number,
        routeColor: bus.color,
        status: bus.status,
        eta_minutes,
        crowdLevel,
        speed,
      };
    });

    // Sort by ETA ascending
    arrivals.sort((a, b) => (a.eta_minutes || 99) - (b.eta_minutes || 99));

    res.json({
      success: true,
      data: {
        stop,
        arrivals,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createStop(req, res, next) {
  try {
    const { name, latitude, longitude, address } = req.body;
    const result = await query(
      'INSERT INTO stops (name, latitude, longitude, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, latitude, longitude, address]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllStops, getStopById, getBusesAtStop, getStopArrivals, createStop };
