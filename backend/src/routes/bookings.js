import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const MAX_BOOKING_DAYS = 90;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(str) {
  if (!str || typeof str !== 'string' || !DATE_REGEX.test(str)) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function isValidDateRange(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return false;
  return end >= start;
}

// All booking routes require authentication
router.use(authMiddleware);

// Check van availability for a date range
router.get('/availability', async (req, res, next) => {
  try {
    const { van_id, start_date, end_date } = req.query;
    if (!van_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'van_id, start_date, and end_date are required' });
    }
    if (!isValidDateRange(start_date, end_date)) {
      return res.status(400).json({ error: 'Invalid date range. Use YYYY-MM-DD and ensure end_date is on or after start_date.' });
    }
    const result = await pool.query(
      `SELECT id FROM bookings
       WHERE van_id = $1
         AND status != 'cancelled'
         AND start_date <= $2::date
         AND end_date >= $3::date`,
      [van_id, end_date, start_date]
    );
    const available = result.rows.length === 0;
    res.json({ available, conflicting_bookings: result.rows.length });
  } catch (err) {
    next(err);
  }
});

// Create a new booking
router.post('/', async (req, res, next) => {
  try {
    const { van_id, start_date, end_date } = req.body;
    if (van_id === undefined || van_id === null || !start_date || !end_date) {
      return res.status(400).json({ error: 'van_id, start_date, and end_date are required' });
    }
    const vanId = parseInt(van_id, 10);
    if (Number.isNaN(vanId) || van_id !== vanId) {
      return res.status(400).json({ error: 'van_id must be a valid number' });
    }
    if (!isValidDateRange(start_date, end_date)) {
      return res.status(400).json({ error: 'Invalid date range. End date must be on or after start date (YYYY-MM-DD).' });
    }
    const start = parseDate(start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ error: 'Start date cannot be in the past.' });
    }
    const end = parseDate(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days > MAX_BOOKING_DAYS) {
      return res.status(400).json({ error: `Booking cannot exceed ${MAX_BOOKING_DAYS} days.` });
    }

    const vanCheck = await pool.query('SELECT id FROM vans WHERE id = $1', [vanId]);
    if (vanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Van not found.' });
    }

    const conflict = await pool.query(
      `SELECT id FROM bookings
       WHERE van_id = $1
         AND status != 'cancelled'
         AND start_date <= $2::date
         AND end_date >= $3::date`,
      [vanId, end_date, start_date]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Van is not available for the selected dates. Please choose different dates.' });
    }

    const result = await pool.query(
      `INSERT INTO bookings (user_id, van_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id, user_id, van_id, start_date, end_date, status, created_at`,
      [req.user.id, vanId, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid van or user. Please refresh and try again.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Invalid dates. End date must be on or after start date.' });
    }
    next(err);
  }
});

// List current user's bookings
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.van_id, b.start_date, b.end_date, b.status, b.created_at,
              v.name AS van_name, v.type AS van_type, v.price_per_day, v.image_url
       FROM bookings b
       JOIN vans v ON v.id = b.van_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }
    const booking = await pool.query(
      'SELECT id, user_id, status FROM bookings WHERE id = $1',
      [id]
    );
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }
    if (booking.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE id = $1
       RETURNING id, user_id, van_id, start_date, end_date, status, created_at`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
