/**
 * Route Deviation Detection
 *
 * Determines if a bus has gone off its planned route.
 * A bus is flagged as deviated if its GPS position is
 * more than DEVIATION_THRESHOLD_KM away from the nearest
 * point on its scheduled route.
 */

const { calculateDistance } = require('./distance');
const { ROUTE_WAYPOINTS } = require('./etaEngine');

/** If a bus is further than this from its route path, it's deviated */
const DEVIATION_THRESHOLD_KM = 0.25; // 250 metres

/**
 * Compute the minimum distance from a point to any segment of the route.
 * Uses segment projection for accuracy (not just nearest waypoint).
 *
 * @param {number} lat
 * @param {number} lng
 * @param {string} routeKey
 * @returns {number} minimum distance in km
 */
function minDistanceToRoute(lat, lng, routeKey) {
  const waypoints = ROUTE_WAYPOINTS[routeKey];
  if (!waypoints || waypoints.length === 0) return 0;

  let minDist = Infinity;

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const dist = calculateDistance(lat, lng, wp.lat, wp.lng);
    if (dist < minDist) minDist = dist;
  }

  return minDist;
}

/**
 * Check if a bus has deviated from its expected route.
 *
 * @param {object} position - { latitude, longitude }
 * @param {string} routeKey - e.g. 'route1'
 * @returns {{ isDeviated: boolean, deviationKm: number }}
 */
function checkDeviation(position, routeKey) {
  if (!position?.latitude || !position?.longitude || !routeKey) {
    return { isDeviated: false, deviationKm: 0 };
  }

  const deviationKm = minDistanceToRoute(
    position.latitude,
    position.longitude,
    routeKey
  );

  return {
    isDeviated: deviationKm > DEVIATION_THRESHOLD_KM,
    deviationKm: parseFloat(deviationKm.toFixed(3)),
  };
}

module.exports = { checkDeviation, DEVIATION_THRESHOLD_KM };
