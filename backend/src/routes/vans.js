import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, minCapacity, maxPrice, sort } = req.query;
    let query = 'SELECT id, type, name, capacity, specs_json, description, price_per_day, image_url FROM vans WHERE 1=1';
    const params = [];
    let i = 1;
    if (type) {
      query += ` AND type ILIKE $${i}`;
      params.push(`%${type}%`);
      i++;
    }
    if (minCapacity) {
      query += ` AND capacity >= $${i}`;
      params.push(parseInt(minCapacity, 10));
      i++;
    }
    if (maxPrice) {
      query += ` AND price_per_day <= $${i}`;
      params.push(parseFloat(maxPrice));
      i++;
    }
    const sortCol = sort === 'capacity' ? 'capacity' : sort === 'name' ? 'name' : 'price_per_day';
    query += ` ORDER BY ${sortCol} ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, type, name, capacity, specs_json, description, price_per_day, image_url FROM vans WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Van not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
