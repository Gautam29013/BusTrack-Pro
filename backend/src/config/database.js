const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error:', err);
});

async function connectPostgres() {
  try {
    const client = await pool.connect();

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        google_id VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin')),
        avatar VARCHAR(500),
        is_verified BOOLEAN DEFAULT false,
        refresh_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        number VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#2563eb',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS route_stops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
        stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
        stop_order INTEGER NOT NULL,
        estimated_minutes INTEGER DEFAULT 0,
        UNIQUE(route_id, stop_id)
      );

      CREATE TABLE IF NOT EXISTS buses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number VARCHAR(20) UNIQUE NOT NULL,
        route_id UUID REFERENCES routes(id),
        driver_id UUID REFERENCES users(id),
        capacity INTEGER DEFAULT 50,
        is_active BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'on_route', 'maintenance')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, route_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_buses_route ON buses(route_id);
      CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
    `);

    client.release();
    logger.info('✅ PostgreSQL connected and tables created');
  } catch (err) {
    logger.error('PostgreSQL connection failed:', err.message);
    throw err;
  }
}

module.exports = connectPostgres;
module.exports.pool = pool;
module.exports.query = (text, params) => pool.query(text, params);
