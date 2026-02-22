import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

router.get('/stats', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const [usersCount, vansCount, bookingsCount, revenueResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM vans'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query(`
        SELECT COALESCE(SUM(
          (end_date - start_date + 1) * v.price_per_day
        ), 0) as total
        FROM bookings b
        JOIN vans v ON v.id = b.van_id
        WHERE b.status = 'confirmed'
      `),
    ]);

    const recentBookings = await pool.query(`
      SELECT b.id, b.start_date, b.end_date, b.status, b.created_at,
             u.name as user_name, u.email as user_email,
             v.name as van_name, v.type as van_type, v.price_per_day
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vans v ON v.id = b.van_id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    res.json({
      users: parseInt(usersCount.rows[0].count),
      vans: parseInt(vansCount.rows[0].count),
      bookings: parseInt(bookingsCount.rows[0].count),
      revenue: parseFloat(revenueResult.rows[0].total || 0),
      recentBookings: recentBookings.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT id, name, email, role, created_at FROM users`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` WHERE name ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countQuery = search
      ? `SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*) FROM users`;
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    if (email) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }
    if (role && ['user', 'admin'].includes(role)) {
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, role`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/vans', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM vans`;
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` WHERE type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countQuery = type
      ? `SELECT COUNT(*) FROM vans WHERE type = $1`
      : `SELECT COUNT(*) FROM vans`;
    const countResult = await pool.query(countQuery, type ? [type] : []);

    res.json({
      vans: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/vans', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { name, type, capacity, price_per_day, description, image_url, specs_json } = req.body;

    if (!name || !type || !capacity || !price_per_day) {
      return res.status(400).json({ error: 'Name, type, capacity, and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO vans (name, type, capacity, price_per_day, description, image_url, specs_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, type, capacity, price_per_day, description || '', image_url || '', specs_json || '{}']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/vans/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, price_per_day, description, image_url, specs_json } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name) { updates.push(`name = $${paramIndex}`); params.push(name); paramIndex++; }
    if (type) { updates.push(`type = $${paramIndex}`); params.push(type); paramIndex++; }
    if (capacity) { updates.push(`capacity = $${paramIndex}`); params.push(capacity); paramIndex++; }
    if (price_per_day) { updates.push(`price_per_day = $${paramIndex}`); params.push(price_per_day); paramIndex++; }
    if (description !== undefined) { updates.push(`description = $${paramIndex}`); params.push(description); paramIndex++; }
    if (image_url !== undefined) { updates.push(`image_url = $${paramIndex}`); params.push(image_url); paramIndex++; }
    if (specs_json !== undefined) { updates.push(`specs_json = $${paramIndex}`); params.push(specs_json); paramIndex++; }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE vans SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Van not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/vans/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const bookingsCheck = await pool.query(
      'SELECT COUNT(*) FROM bookings WHERE van_id = $1 AND status = $2',
      [id, 'confirmed']
    );
    
    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete van with active bookings' });
    }

    const result = await pool.query('DELETE FROM vans WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Van not found' });
    }

    res.json({ message: 'Van deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/bookings', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email,
             v.name as van_name, v.type as van_type, v.price_per_day, v.image_url
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vans v ON v.id = b.van_id
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countQuery = status
      ? `SELECT COUNT(*) FROM bookings WHERE status = $1`
      : `SELECT COUNT(*) FROM bookings`;
    const countResult = await pool.query(countQuery, status ? [status] : []);

    res.json({
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/bookings/:id/status', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/settings', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    
    settings.gemini_key_configured = !!process.env.GEMINI_API_KEY;
    
    res.json(settings);
  } catch (err) {
    if (err.code === '42P01') {
      res.json({ gemini_key_configured: !!process.env.GEMINI_API_KEY });
    } else {
      next(err);
    }
  }
});

router.put('/settings', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const settings = req.body;
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (const [key, value] of Object.entries(settings)) {
      if (key === 'gemini_api_key' && value) {
        process.env.GEMINI_API_KEY = value;
      }
      
      await pool.query(`
        INSERT INTO settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
      `, [key, typeof value === 'string' ? value : JSON.stringify(value)]);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
