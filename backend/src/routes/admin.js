const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/admin/broadcast
// Admins can push system-wide notifications
router.post('/broadcast', authenticate, authorize('admin'), (req, res) => {
  const { message, severity = 'info' } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  // Get io instance attached to app
  const io = req.app.get('io');
  
  // Emit to all connected clients
  io.emit('system_alert', {
    id: Date.now().toString(),
    message,
    severity,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Broadcast sent' });
});

module.exports = router;
