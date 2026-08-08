const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');
const crypto = require('crypto');

// GET /api/payments/tickets
// Get all tickets for current user
router.get('/tickets', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM user_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/checkout
// Generate a mock checkout session & immediately issue ticket for local testing
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { ticketType, price } = req.body;
    
    if (!ticketType || !price) {
      return res.status(400).json({ success: false, message: 'Ticket type and price required' });
    }

    // Since we are mocking Stripe locally, we just create the ticket immediately.
    // In production, this would return a Stripe Checkout URL, and the ticket would
    // be created inside a Stripe Webhook handler.
    const qrData = `ticket_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date();
    
    if (ticketType === 'Single Ride') {
      expiresAt.setHours(expiresAt.getHours() + 2); // 2 hour validity
    } else if (ticketType === 'Daily Pass') {
      expiresAt.setDate(expiresAt.getDate() + 1); // 24 hour validity
    }

    const result = await query(
      'INSERT INTO user_tickets (user_id, ticket_type, price, qr_data, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, ticketType, price, qrData, expiresAt]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Mock Checkout Successful! Ticket Issued.',
      data: result.rows[0] 
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
