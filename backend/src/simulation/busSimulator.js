const { query } = require('../config/database');
const BusLocation = require('../models/BusLocation');
const { calculateBearing } = require('../utils/distance');
const { calculateETA } = require('../utils/etaEngine');
const { checkDeviation } = require('../utils/routeDeviation');
const logger = require('../utils/logger');

// Realistic city routes with waypoints (lat/lng around a fictional city center)
const ROUTE_WAYPOINTS = {
  route1: [
    { lat: 28.6139, lng: 77.2090 }, // Delhi-like coords
    { lat: 28.6180, lng: 77.2150 },
    { lat: 28.6220, lng: 77.2200 },
    { lat: 28.6260, lng: 77.2250 },
    { lat: 28.6300, lng: 77.2300 },
    { lat: 28.6340, lng: 77.2350 },
    { lat: 28.6380, lng: 77.2400 },
  ],
  route2: [
    { lat: 28.6050, lng: 77.2000 },
    { lat: 28.6080, lng: 77.2080 },
    { lat: 28.6100, lng: 77.2150 },
    { lat: 28.6130, lng: 77.2220 },
    { lat: 28.6160, lng: 77.2290 },
    { lat: 28.6190, lng: 77.2360 },
  ],
  route3: [
    { lat: 28.6200, lng: 77.1950 },
    { lat: 28.6230, lng: 77.2020 },
    { lat: 28.6260, lng: 77.2090 },
    { lat: 28.6290, lng: 77.2160 },
    { lat: 28.6320, lng: 77.2230 },
    { lat: 28.6350, lng: 77.2300 },
  ],
};

const MOCK_BUSES = [
  { id: 'bus-sim-001', number: 'B101', routeKey: 'route1' },
  { id: 'bus-sim-002', number: 'B202', routeKey: 'route2' },
  { id: 'bus-sim-003', number: 'B303', routeKey: 'route3' },
  { id: 'bus-sim-004', number: 'B404', routeKey: 'route1' },
  { id: 'bus-sim-005', number: 'B505', routeKey: 'route2' },
];

class BusSimulator {
  constructor(io) {
    this.io = io;
    this.busStates = {};
    this.interval = null;
    this.updateMs = parseInt(process.env.SIMULATOR_UPDATE_INTERVAL || '3000');

    // Initialize bus state positions along their routes
    MOCK_BUSES.forEach((bus, i) => {
      const waypoints = ROUTE_WAYPOINTS[bus.routeKey];
      this.busStates[bus.id] = {
        ...bus,
        waypointIndex: i % waypoints.length, // start at different positions
        progress: Math.random(), // 0-1 progress between waypoints
        speed: 20 + Math.random() * 20, // 20–40 km/h
        passengerCount: Math.floor(Math.random() * 40),
      };
    });
  }

  _interpolate(from, to, t) {
    return {
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    };
  }

  _nextPosition(state) {
    const waypoints = ROUTE_WAYPOINTS[state.routeKey];
    const from = waypoints[state.waypointIndex];
    const toIndex = (state.waypointIndex + 1) % waypoints.length;
    const to = waypoints[toIndex];

    // Advance progress
    const progressStep = 0.04 + Math.random() * 0.03;
    state.progress += progressStep;

    if (state.progress >= 1) {
      state.progress = 0;
      state.waypointIndex = toIndex;
    }

    const pos = this._interpolate(from, to, state.progress);
    const heading = calculateBearing(from.lat, from.lng, to.lat, to.lng);
    state.speed = Math.max(10, Math.min(50, state.speed + (Math.random() - 0.5) * 5));
    state.passengerCount = Math.max(0, Math.min(50, state.passengerCount + Math.floor(Math.random() * 3 - 1)));

    return {
      latitude: parseFloat(pos.lat.toFixed(6)),
      longitude: parseFloat(pos.lng.toFixed(6)),
      speed: parseFloat(state.speed.toFixed(1)),
      heading: parseFloat(heading.toFixed(1)),
      passengerCount: state.passengerCount,
    };
  }

  async _ensureBusesInDB() {
    try {
      // Ensure a default route exists
      const routeCheck = await query("SELECT id FROM routes WHERE number = 'SIM-R1' LIMIT 1");
      let routeId;
      if (!routeCheck.rows[0]) {
        const r1 = await query(
          "INSERT INTO routes (name, number, color) VALUES ('City Loop North', 'SIM-R1', '#3b82f6') ON CONFLICT (number) DO NOTHING RETURNING id"
        );
        const r2 = await query(
          "INSERT INTO routes (name, number, color) VALUES ('City Express South', 'SIM-R2', '#10b981') ON CONFLICT (number) DO NOTHING RETURNING id"
        );
        const r3 = await query(
          "INSERT INTO routes (name, number, color) VALUES ('Downtown Shuttle', 'SIM-R3', '#f59e0b') ON CONFLICT (number) DO NOTHING RETURNING id"
        );
      }

      const routeMap = {};
      const routes = await query("SELECT id, number FROM routes WHERE number IN ('SIM-R1','SIM-R2','SIM-R3')");
      routes.rows.forEach(r => {
        if (r.number === 'SIM-R1') routeMap['route1'] = r.id;
        if (r.number === 'SIM-R2') routeMap['route2'] = r.id;
        if (r.number === 'SIM-R3') routeMap['route3'] = r.id;
      });

      for (const bus of MOCK_BUSES) {
        const rId = routeMap[bus.routeKey];
        if (!rId) continue;
        await query(
          `INSERT INTO buses (id, number, route_id, status, is_active)
           VALUES ($1, $2, $3, 'on_route', true)
           ON CONFLICT (number) DO UPDATE SET status = 'on_route', is_active = true, route_id = $3`,
          [bus.id, bus.number, rId]
        );
        // Store routeId in state
        this.busStates[bus.id].routeId = rId;
      }

      // Seed bus stops for each route
      const STOPS_DATA = [
        // Route 1 stops (City Loop North)
        { name: 'Central Station', lat: 28.6139, lng: 77.2090, addr: 'Central Delhi', routeKey: 'route1' },
        { name: 'Connaught Place', lat: 28.6220, lng: 77.2200, addr: 'Connaught Place, Delhi', routeKey: 'route1' },
        { name: 'Karol Bagh Terminus', lat: 28.6300, lng: 77.2300, addr: 'Karol Bagh, Delhi', routeKey: 'route1' },
        { name: 'North Campus Gate', lat: 28.6380, lng: 77.2400, addr: 'North Campus, Delhi', routeKey: 'route1' },
        // Route 2 stops (City Express South)
        { name: 'South Delhi Hub', lat: 28.6050, lng: 77.2000, addr: 'South Delhi', routeKey: 'route2' },
        { name: 'Lodi Garden Stop', lat: 28.6100, lng: 77.2150, addr: 'Lodi Garden, Delhi', routeKey: 'route2' },
        { name: 'India Gate Circle', lat: 28.6160, lng: 77.2290, addr: 'India Gate, Delhi', routeKey: 'route2' },
        // Route 3 stops (Downtown Shuttle)
        { name: 'Old Delhi Gate', lat: 28.6200, lng: 77.1950, addr: 'Old Delhi', routeKey: 'route3' },
        { name: 'Chandni Chowk', lat: 28.6260, lng: 77.2090, addr: 'Chandni Chowk, Delhi', routeKey: 'route3' },
        { name: 'Red Fort Square', lat: 28.6350, lng: 77.2300, addr: 'Red Fort, Delhi', routeKey: 'route3' },
      ];

      for (let idx = 0; idx < STOPS_DATA.length; idx++) {
        const s = STOPS_DATA[idx];
        const rId = routeMap[s.routeKey];
        if (!rId) continue;
        // Upsert stop by name to avoid duplicates on restart
        const stopRes = await query(
          `INSERT INTO stops (name, latitude, longitude, address)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (name) DO UPDATE SET latitude = $2, longitude = $3
           RETURNING id`,
          [s.name, s.lat, s.lng, s.addr]
        );
        const stopId = stopRes.rows[0]?.id;
        if (stopId) {
          await query(
            `INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_minutes)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (route_id, stop_id) DO NOTHING`,
            [rId, stopId, idx, (idx + 1) * 3]
          );
        }
      }

      logger.info(`🗄️  Simulator: ${MOCK_BUSES.length} buses + stops seeded in DB`);
    } catch (err) {
      logger.warn('Simulator DB seed error (non-fatal):', err.message);
    }
  }

  async _broadcast(busId) {
    const state = this.busStates[busId];
    if (!state) return;

    const pos = this._nextPosition(state);
    // Keep live position on state so global.busSimulatorState has current coordinates
    state.latitude = pos.latitude;
    state.longitude = pos.longitude;
    state.speed = pos.speed;
    state.passengerCount = pos.passengerCount;

    // Derive crowd level from passenger count
    const crowdLevel = pos.passengerCount < 15
      ? 'empty'
      : pos.passengerCount < 35
        ? 'moderate'
        : 'full';

    // Smart ETA calculation
    const eta_minutes = calculateETA(state, pos);

    // Twilio Alerts Hook (Mock)
    if (global.activeAlerts && global.activeAlerts.length > 0 && typeof eta_minutes === 'number') {
      const remainingAlerts = [];
      for (const alert of global.activeAlerts) {
        if (alert.busId === busId && eta_minutes <= alert.threshold) {
          logger.info(`[TWILIO MOCK] 📱 SMS Sent to ${alert.phoneNumber}: "BusTrackPro: Bus ${state.number} is arriving at ${alert.stopName} in ${eta_minutes} mins!"`);
        } else {
          remainingAlerts.push(alert);
        }
      }
      global.activeAlerts = remainingAlerts;
    }

    // Route deviation detection
    // Occasionally introduce a simulated deviation for demo purposes (5% chance)
    const simulateDeviation = Math.random() < 0.05;
    const deviation = simulateDeviation
      ? { isDeviated: true, deviationKm: 0.3 + Math.random() * 0.4 }
      : checkDeviation(pos, state.routeKey);

    try {
      // Save to MongoDB
      await BusLocation.create({
        busId,
        busNumber: state.number,
        routeId: state.routeId || 'unknown',
        ...pos,
        timestamp: new Date(),
      });

      // Emit to all subscribers
      const payload = {
        busId,
        busNumber: state.number,
        routeId: state.routeId,
        ...pos,
        crowdLevel,
        eta_minutes,
        isDeviated: deviation.isDeviated,
        deviationKm: deviation.deviationKm,
        timestamp: new Date().toISOString(),
      };

      this.io.of('/buses').to(`bus:${busId}`).emit('location-update', payload);
      this.io.of('/buses').to('all-buses').emit('location-update', payload);
    } catch (err) {
      // Silently fail if DB not ready yet
    }
  }

  async syncDynamicRoutes() {
    try {
      const routes = await query("SELECT * FROM routes WHERE is_active = true");
      for (const route of routes.rows) {
        // Check if we already have a bus for this routeId
        const hasBus = Object.values(this.busStates).some(b => b.routeId === route.id);
        if (!hasBus) {
          // Spawn a new mock bus
          const busId = 'bus-sim-dyn-' + route.id;
          const busNumber = 'B-' + route.number;
          
          // Generate 5 random waypoints around Delhi center
          const waypoints = [];
          const centerLat = 28.6139;
          const centerLng = 77.2090;
          for (let i = 0; i < 5; i++) {
            waypoints.push({
              lat: centerLat + (Math.random() - 0.5) * 0.1,
              lng: centerLng + (Math.random() - 0.5) * 0.1
            });
          }
          
          ROUTE_WAYPOINTS[route.id] = waypoints; // Store waypoints dynamically

          // Register in DB
          await query(
            `INSERT INTO buses (id, number, route_id, status, is_active)
             VALUES ($1, $2, $3, 'on_route', true)
             ON CONFLICT (number) DO NOTHING`,
             [busId, busNumber, route.id]
          );

          // Add to simulator state
          this.busStates[busId] = {
            id: busId,
            number: busNumber,
            routeId: route.id,
            routeKey: route.id, // Use route.id as the key for ROUTE_WAYPOINTS
            waypointIndex: 0,
            progress: 0,
            speed: 20 + Math.random() * 20,
            passengerCount: Math.floor(Math.random() * 40)
          };
          logger.info(`🚌 Spawned dynamic simulated bus ${busNumber} for new route ${route.number}`);
        }
      }
    } catch (err) {
      logger.error('Dynamic route sync error:', err.message);
    }
  }

  async start() {
    await this._ensureBusesInDB();
    await this.syncDynamicRoutes(); // Initial sync

    this.interval = setInterval(() => {
      Object.keys(this.busStates).forEach((busId) => this._broadcast(busId));
    }, this.updateMs);
    
    // Check for new routes every 10 seconds
    this.syncInterval = setInterval(() => {
      this.syncDynamicRoutes();
    }, 10000);

    logger.info(`🚌 Simulator broadcasting buses every ${this.updateMs}ms`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

module.exports = BusSimulator;
