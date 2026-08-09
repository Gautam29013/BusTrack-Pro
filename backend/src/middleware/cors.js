const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

module.exports = { corsMiddleware: cors(corsOptions) };
