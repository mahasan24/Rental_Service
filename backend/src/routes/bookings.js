import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/availability', async (req, res, next) => {
  try {
    const { van_id, start_date, end_date } = req.query;
    if (!van_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'van_id, start_date, and end_date are required' });
    }
    const result = await pool.query(
      `SELECT id FROM bookings WHERE van_id = $1 AND status != 'cancelled'
       AND start_date <= $2::date AND end_date >= $3::date`,
      [van_id, end_date, start_date]
    );
    res.json({ available: result.rows.length === 0, conflicting_bookings: result.rows.length });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { van_id, start_date, end_date } = req.body;
    if (!van_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'van_id, start_date, and end_date are required' });
    }
    const conflict = await pool.query(
      `SELECT id FROM bookings WHERE van_id = $1 AND status != 'cancelled'
       AND start_date <= $2::date AND end_date >= $3::date`,
      [van_id, end_date, start_date]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Van is not available for the selected dates' });
    }
    const result = await pool.query(
      `INSERT INTO bookings (user_id, van_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id, user_id, van_id, start_date, end_date, status, created_at`,
      [req.user.id, van_id, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.van_id, b.start_date, b.end_date, b.status, b.created_at,
              v.name AS van_name, v.type AS van_type, v.price_per_day, v.image_url
       FROM bookings b JOIN vans v ON v.id = b.van_id WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await pool.query('SELECT id, user_id, status FROM bookings WHERE id = $1', [req.params.id]);
    if (booking.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    if (booking.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'You can only cancel your own bookings' });
    if (booking.rows[0].status === 'cancelled') return res.status(400).json({ error: 'Booking is already cancelled' });
    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING id, user_id, van_id, start_date, end_date, status, created_at`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
