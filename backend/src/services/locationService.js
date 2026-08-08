const BusLocation = require('../models/BusLocation');
const { query } = require('../config/database');
const { calculateDistance } = require('../utils/distance');
const logger = require('../utils/logger');

class LocationService {
  /**
   * Store new GPS location in MongoDB and broadcast to Socket.io
   */
  async updateBusLocation(busId, locationData, io) {
    const { latitude, longitude, speed = 0, heading = 0 } = locationData;

    // Fetch bus info from Postgres
    const busResult = await query(
      `SELECT b.id, b.number, b.route_id, r.name as route_name
       FROM buses b LEFT JOIN routes r ON b.route_id = r.id
       WHERE b.id = $1`,
      [busId]
    );
    const bus = busResult.rows[0];
    if (!bus) throw Object.assign(new Error('Bus not found'), { statusCode: 404 });

    // Save to MongoDB
    const location = new BusLocation({
      busId,
      busNumber: bus.number,
      routeId: bus.route_id,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date(),
    });
    await location.save();

    // Broadcast to all subscribers on /buses namespace
    if (io) {
      io.of('/buses').to(`bus:${busId}`).emit('location-update', {
        busId,
        busNumber: bus.number,
        routeId: bus.route_id,
        routeName: bus.route_name,
        latitude,
        longitude,
        speed,
        heading,
        timestamp: location.timestamp,
      });
    }

    return location;
  }

  /**
   * Get the latest location for a single bus
   */
  async getLatestLocation(busId) {
    return BusLocation.findOne({ busId }).sort({ timestamp: -1 }).lean();
  }

  /**
   * Get latest locations for all active buses
   */
  async getAllLatestLocations() {
    const result = await query(
      `SELECT b.id, b.number, r.name as route_name, r.color
       FROM buses b LEFT JOIN routes r ON b.route_id = r.id
       WHERE b.is_active = true AND b.status = 'on_route'`
    );

    const buses = result.rows;
    const locations = await Promise.all(
      buses.map(async (bus) => {
        const loc = await BusLocation.findOne({ busId: bus.id })
          .sort({ timestamp: -1 })
          .lean();
        return loc ? { ...bus, ...loc } : null;
      })
    );

    return locations.filter(Boolean);
  }
}

module.exports = new LocationService();
