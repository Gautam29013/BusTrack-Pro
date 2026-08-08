const { query } = require('../config/database');

/**
 * GET /api/analytics/dashboard
 * Returns simulated historical data for the Analytics Dashboard:
 * - Punctuality (on-time performance per route over 7 days)
 * - Ridership (passenger count by hour for today)
 * - Heatmap (congestion level at physical stops)
 */
async function getDashboardData(req, res, next) {
  try {
    // 1. Fetch real routes to base our mock data on
    const routesRes = await query('SELECT id, name, number, color FROM routes');
    const routes = routesRes.rows;

    // 2. Fetch real stops for the heatmap
    const stopsRes = await query('SELECT id, name, latitude, longitude FROM stops');
    const stops = stopsRes.rows;

    // ── Generate Punctuality Data (Last 7 Days) ──
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const punctualityData = days.map((day) => {
      const dayData = { name: day };
      routes.forEach((route) => {
        // Random performance between 75% and 98%
        const onTimePercent = Math.floor(Math.random() * (98 - 75 + 1)) + 75;
        dayData[route.number] = onTimePercent;
      });
      return dayData;
    });

    // ── Generate Ridership Stats (24 Hours) ──
    const ridershipData = [];
    for (let hour = 0; hour < 24; hour++) {
      const label = hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
      const hourData = { time: label };
      
      // Base traffic curve (peak at 8AM and 5PM)
      let baseLoad = 20;
      if (hour === 8 || hour === 9) baseLoad = 85;
      else if (hour === 17 || hour === 18) baseLoad = 95;
      else if (hour > 10 && hour < 16) baseLoad = 45;
      else if (hour > 20 || hour < 5) baseLoad = 5;

      routes.forEach((route) => {
        // Add some noise to the base curve per route
        const noise = Math.floor(Math.random() * 20) - 10;
        hourData[route.number] = Math.max(0, baseLoad + noise);
      });
      ridershipData.push(hourData);
    }

    // ── Generate Heatmap Data ──
    // We attach a randomly generated "passengerVolume" or "congestion" score to each stop
    const heatmapData = stops.map(stop => ({
      id: stop.id,
      name: stop.name,
      latitude: parseFloat(stop.latitude),
      longitude: parseFloat(stop.longitude),
      // volume 1-100
      volume: Math.floor(Math.random() * 100) + 1,
    }));

    res.json({
      success: true,
      data: {
        punctuality: punctualityData,
        ridership: ridershipData,
        heatmap: heatmapData,
        routes: routes, // for colors/legends
      }
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardData
};
