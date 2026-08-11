const { query } = require('../config/database');

// GET /api/routes
async function getAllRoutes(req, res, next) {
  try {
    const result = await query('SELECT * FROM routes ORDER BY number ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/routes
async function createRoute(req, res, next) {
  try {
    const { name, number, description, color } = req.body;
    const result = await query(
      'INSERT INTO routes (name, number, description, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, number, description, color || '#3b82f6']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/routes/:id
async function updateRoute(req, res, next) {
  try {
    const { id } = req.params;
    const { name, number, description, color } = req.body;
    const result = await query(
      'UPDATE routes SET name = $1, number = $2, description = $3, color = $4 WHERE id = $5 RETURNING *',
      [name, number, description, color, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/routes/:id
async function deleteRoute(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM routes WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllRoutes, createRoute, updateRoute, deleteRoute };
