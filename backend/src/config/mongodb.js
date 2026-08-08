const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect...');
});

module.exports = connectMongo;
