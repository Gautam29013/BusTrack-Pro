const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// In-memory store for alerts (in a real app, this would be in Redis or Postgres)
global.activeAlerts = global.activeAlerts || [];

// POST /api/alerts/subscribe
router.post('/subscribe', (req, res) => {
  const { phoneNumber, busId, stopName, threshold } = req.body;
  
  if (!phoneNumber || !busId) {
    return res.status(400).json({ success: false, message: 'Missing phone number or bus ID' });
  }

  // Push to global array to be checked by ETA engine/simulator
  global.activeAlerts.push({
    id: Date.now().toString(),
    phoneNumber,
    busId,
    stopName,
    threshold: threshold || 5, // minutes
    createdAt: new Date()
  });

  logger.info(`New SMS Alert subscribed for ${phoneNumber} on bus ${busId}`);
  res.json({ success: true, message: 'Subscribed to alerts' });
});

module.exports = router;
