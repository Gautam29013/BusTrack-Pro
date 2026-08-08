require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./src/utils/logger');
const { corsMiddleware } = require('./src/middleware/cors');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimit');
const connectPostgres = require('./src/config/database');
const connectMongo = require('./src/config/mongodb');
const connectRedis = require('./src/config/redis');
const passport = require('./src/config/passport');
const setupBusNamespace = require('./src/sockets/busNamespace');
const BusSimulator = require('./src/simulation/busSimulator');

// Routes
const authRoutes = require('./src/routes/auth');
const busRoutes = require('./src/routes/buses');
const stopRoutes = require('./src/routes/stops');
const userRoutes = require('./src/routes/users');
const analyticsRoutes = require('./src/routes/analytics');
const routeRoutes = require('./src/routes/routes');
const adminRoutes = require('./src/routes/admin');
const alertsRoutes = require('./src/routes/alerts');
const paymentsRoutes = require('./src/routes/payments');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.set('io', io);

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(passport.initialize());
app.use('/api/', apiLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── Retry helper ─────────────────────────────────────────────────────────────
async function withRetry(fn, name, maxAttempts = 10, delayMs = 3000) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      logger.warn(`⏳ ${name} not ready (attempt ${i}/${maxAttempts}): ${err.message}`);
      if (i === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// ─── Boot ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  // Start HTTP server immediately so health checks work during DB boot
  httpServer.listen(PORT, () => {
    logger.info(`🚀 BusTrackPro backend running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  });

  try {
    // Wait for databases with retries (handles Docker startup ordering)
    await withRetry(connectPostgres, 'PostgreSQL');
    await withRetry(connectMongo, 'MongoDB');
    await withRetry(connectRedis, 'Redis');

    // Setup Socket.io namespaces after DB is ready
    setupBusNamespace(io);

    // Start bus simulator
    if (process.env.ENABLE_BUS_SIMULATOR === 'true') {
      const simulator = new BusSimulator(io);
      await simulator.start();
      // Expose live bus states globally so stop arrivals can compute real ETAs
      global.busSimulatorState = simulator.busStates;
      logger.info('🚌 Bus simulator started');
    }

    logger.info('✅ All services connected — fully operational');
  } catch (err) {
    logger.error('❌ Could not connect to required services:', err.message);
    logger.error('Make sure PostgreSQL, MongoDB, and Redis are running.');
    process.exit(1);
  }
}

start();

module.exports = app;
