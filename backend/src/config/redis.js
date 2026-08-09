const Redis = require('ioredis');
const logger = require('../utils/logger');

let client;

async function connectRedis() {
  return new Promise((resolve, reject) => {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      connectTimeout: 5000,
      lazyConnect: false,
    });

    client.once('ready', () => {
      logger.info('✅ Redis connected');
      resolve(client);
    });

    client.once('error', (err) => {
      client.disconnect();
      reject(err);
    });
  });
}

function getRedis() {
  if (!client) throw new Error('Redis not initialized. Call connectRedis() first.');
  return client;
}

module.exports = connectRedis;
module.exports.getRedis = getRedis;
