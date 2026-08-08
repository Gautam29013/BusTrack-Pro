/**
 * Smart ETA Engine
 * 
 * Calculates arrival time using:
 *  - GPS distance (Haversine)
 *  - Live bus speed
 *  - Time-of-day traffic factor (simulates rush hour)
 *  - Passenger dwell time per stop
 */

const { calculateDistance } = require('./distance');

/** Route waypoints — must match busSimulator.js exactly */
const ROUTE_WAYPOINTS = {
  route1: [
    { lat: 28.6139, lng: 77.2090 },
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

/**
 * Returns a traffic multiplier based on hour of day.
 * Rush hours (8-10am, 5-8pm) slow buses down.
 */
function getTrafficFactor() {
  const hour = new Date().getHours();
  // Morning rush: 8–10 AM
  if (hour >= 8 && hour < 10) return 1.5;
  // Evening rush: 17–20 (5–8 PM)
  if (hour >= 17 && hour < 20) return 1.7;
  // Late night: faster
  if (hour >= 22 || hour < 6) return 0.8;
  // Normal
  return 1.0;
}

/**
 * Calculate total remaining route distance for a bus from its
 * current position to the end of its current route cycle.
 *
 * @param {string} routeKey - e.g. 'route1'
 * @param {number} currentLat
 * @param {number} currentLng
 * @param {number} waypointIndex - current waypoint index the bus is between
 * @param {number} progress - 0-1, how far between waypointIndex and next
 * @returns {number} distance in km to next stop waypoint
 */
function distanceToNextWaypoint(routeKey, currentLat, currentLng, waypointIndex, progress) {
  const waypoints = ROUTE_WAYPOINTS[routeKey];
  if (!waypoints) return 1;

  const nextIndex = (waypointIndex + 1) % waypoints.length;
  const next = waypoints[nextIndex];

  return calculateDistance(currentLat, currentLng, next.lat, next.lng);
}

/**
 * Full smart ETA calculation.
 * Returns ETA in minutes (integer, clamped to 1–60).
 *
 * @param {object} busState - from simulator's busStates
 * @param {object} position - { latitude, longitude, speed }
 */
function calculateETA(busState, position) {
  try {
    const speed = Math.max(5, position.speed || 20); // km/h, min 5
    const trafficFactor = getTrafficFactor();

    // Distance to next waypoint in km
    const distKm = distanceToNextWaypoint(
      busState.routeKey,
      position.latitude,
      position.longitude,
      busState.waypointIndex,
      busState.progress
    );

    // Effective speed accounting for traffic
    const effectiveSpeed = speed / trafficFactor;

    // Base ETA in minutes
    let etaMinutes = (distKm / effectiveSpeed) * 60;

    // Add dwell time: ~20s per stop (accounting for passengers boarding)
    const dwellTime = 0.33; // ~20 seconds in minutes
    etaMinutes += dwellTime;

    // Add jitter to make it feel realistic (+/- 30s)
    const jitter = (Math.random() - 0.5) * 0.5;
    etaMinutes += jitter;

    return Math.round(Math.max(1, Math.min(60, etaMinutes)));
  } catch {
    return Math.round(3 + Math.random() * 5);
  }
}

/**
 * Calculate ETA from a bus's current position to a specific stop location.
 *
 * @param {object} busPosition - { latitude, longitude, speed }
 * @param {object} stopLocation - { latitude: number, longitude: number }
 * @returns {number} ETA in minutes
 */
function calculateETAToStop(busPosition, stopLocation) {
  try {
    const speed = Math.max(5, busPosition.speed || 20);
    const trafficFactor = getTrafficFactor();
    const effectiveSpeed = speed / trafficFactor;
    const distKm = calculateDistance(
      busPosition.latitude,
      busPosition.longitude,
      stopLocation.latitude,
      stopLocation.longitude
    );
    const etaMinutes = (distKm / effectiveSpeed) * 60 + 0.33;
    return Math.round(Math.max(1, Math.min(90, etaMinutes)));
  } catch {
    return Math.round(2 + Math.random() * 8);
  }
}

module.exports = { calculateETA, calculateETAToStop, getTrafficFactor, ROUTE_WAYPOINTS };
