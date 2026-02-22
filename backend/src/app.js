import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import vanRoutes from './routes/vans.js';
import bookingRoutes from './routes/bookings.js';
import recommendationsRoutes from './routes/recommendations.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = FRONTEND_URL.split(',').map(url => url.trim());
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  }, 
  credentials: true 
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vans', vanRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
