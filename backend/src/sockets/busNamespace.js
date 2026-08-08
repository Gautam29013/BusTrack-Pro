const socketAuth = require('./socketMiddleware');
const logger = require('../utils/logger');

/**
 * Setup /buses Socket.io namespace for real-time bus tracking
 */
function setupBusNamespace(io) {
  const busNs = io.of('/buses');

  busNs.use(socketAuth);

  busNs.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | user: ${socket.user?.id || 'anonymous'}`);

    // ── Subscribe to specific bus ──────────────────────────────────────────────
    socket.on('subscribe', ({ busId }) => {
      if (!busId) return;
      const room = `bus:${busId}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} subscribed to bus:${busId}`);
      socket.emit('subscribed', { busId, room });
    });

    // ── Unsubscribe from specific bus ──────────────────────────────────────────
    socket.on('unsubscribe', ({ busId }) => {
      socket.leave(`bus:${busId}`);
      logger.info(`Socket ${socket.id} unsubscribed from bus:${busId}`);
    });

    // ── Subscribe to all buses (dashboard view) ────────────────────────────────
    socket.on('subscribe-all', () => {
      socket.join('all-buses');
      logger.info(`Socket ${socket.id} subscribed to all buses`);
    });

    // ── Driver Location Broadcast (Admin/Driver Portal) ────────────────────────
    socket.on('driver_location_update', (data) => {
      // Broadcast this live location as a standard bus_update event
      busNs.to(`bus:${data.busId}`).emit('bus_update', data);
      busNs.to('all-buses').emit('bus_update', data);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  return busNs;
}

module.exports = setupBusNamespace;
