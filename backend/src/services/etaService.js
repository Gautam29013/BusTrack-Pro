const { calculateDistance } = require('../utils/distance');
const { query } = require('../config/database');
const BusLocation = require('../models/BusLocation');

const AVG_BUS_SPEED_KMH = 25; // conservative urban speed

class ETAService {
  /**
   * Calculate ETA from bus current location to a specific stop
   * Returns minutes
   */
  async calculateETA(busId, targetStopId) {
    // Get current bus location
    const location = await BusLocation.findOne({ busId }).sort({ timestamp: -1 }).lean();
    if (!location) return null;

    // Get target stop coordinates
    const stopResult = await query(
      'SELECT latitude, longitude, name FROM stops WHERE id = $1',
      [targetStopId]
    );
    const stop = stopResult.rows[0];
    if (!stop) return null;

    const distanceKm = calculateDistance(
      location.latitude,
      location.longitude,
      parseFloat(stop.latitude),
      parseFloat(stop.longitude)
    );

    const speedKmh = location.speed > 2 ? location.speed : AVG_BUS_SPEED_KMH;
    const etaMinutes = Math.round((distanceKm / speedKmh) * 60);

    return {
      busId,
      stopId: targetStopId,
      stopName: stop.name,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      etaMinutes: Math.max(1, etaMinutes),
      calculatedAt: new Date(),
    };
  }

  /**
   * Get ETAs for all upcoming stops on a route from the bus's current position
   */
  async getUpcomingStopsETA(busId) {
    // Get bus's route
    const busResult = await query(
      'SELECT route_id FROM buses WHERE id = $1',
      [busId]
    );
    if (!busResult.rows[0]) return [];

    const { route_id } = busResult.rows[0];

    // Get current location
    const location = await BusLocation.findOne({ busId }).sort({ timestamp: -1 }).lean();
    if (!location) return [];

    // Get all stops on this route in order
    const stopsResult = await query(
      `SELECT s.id, s.name, s.latitude, s.longitude, rs.stop_order, rs.estimated_minutes
       FROM route_stops rs
       JOIN stops s ON rs.stop_id = s.id
       WHERE rs.route_id = $1
       ORDER BY rs.stop_order ASC`,
      [route_id]
    );

    // Find the nearest next stop (approximate by closest distance)
    const stops = stopsResult.rows;
    let cumulativeMinutes = 0;

    return stops.map((stop) => {
      const distKm = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(stop.latitude),
        parseFloat(stop.longitude)
      );
      const speed = location.speed > 2 ? location.speed : AVG_BUS_SPEED_KMH;
      const minutes = Math.round((distKm / speed) * 60);

      return {
        stopId: stop.id,
        stopName: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        order: stop.stop_order,
        etaMinutes: Math.max(1, minutes),
        distanceKm: parseFloat(distKm.toFixed(2)),
      };
    });
  }
}

module.exports = new ETAService();
