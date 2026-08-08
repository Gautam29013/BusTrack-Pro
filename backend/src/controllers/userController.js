const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function getProfile(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, avatar } = req.body;
    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, role, avatar`,
      [name, avatar, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user?.password) {
      return res.status(400).json({ success: false, message: 'No password set (OAuth user)' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

async function getFavorites(req, res, next) {
  try {
    const result = await query(
      `SELECT r.id, r.name, r.number, r.color, r.description
       FROM user_favorites uf JOIN routes r ON uf.route_id = r.id
       WHERE uf.user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const { routeId } = req.body;
    await query(
      'INSERT INTO user_favorites (user_id, route_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, routeId]
    );
    res.status(201).json({ success: true, message: 'Favorite added' });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND route_id = $2',
      [req.user.id, req.params.routeId]
    );
    res.json({ success: true, message: 'Favorite removed' });
  } catch (err) {
    next(err);
  }
}

async function getJourneyHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT t.id, t.bus_id, t.created_at, 
              r.name as route_name, r.number as route_number, r.color as route_color,
              sf.name as from_stop_name, 
              st.name as to_stop_name
       FROM user_trips t
       LEFT JOIN routes r ON t.route_id = r.id
       LEFT JOIN stops sf ON t.from_stop_id = sf.id
       LEFT JOIN stops st ON t.to_stop_id = st.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function addJourneyHistory(req, res, next) {
  try {
    const { busId, routeId, fromStopId, toStopId } = req.body;
    await query(
      'INSERT INTO user_trips (user_id, bus_id, route_id, from_stop_id, to_stop_id) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, busId, routeId, fromStopId, toStopId]
    );
    res.status(201).json({ success: true, message: 'Journey logged' });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getProfile, updateProfile, changePassword, 
  getFavorites, addFavorite, removeFavorite,
  getJourneyHistory, addJourneyHistory 
};
