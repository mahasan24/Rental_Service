import { Router } from 'express';
import { getRecommendedVans, getPersonalizedRecommendations, getUserBookingHistory, analyzeNeed } from '../services/recommendations.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/recommendations — get recommendations based on need text
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { need } = req.body;
    if (!need || typeof need !== 'string' || need.trim().length === 0) {
      return res.status(400).json({ error: 'Please describe what you need the van for.' });
    }
    const userId = req.user?.id || null;
    const result = await getRecommendedVans(need.trim(), userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/recommendations/personalized — get personalized recommendations for logged-in user
router.get('/personalized', optionalAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      const popular = await getRecommendedVans('popular vans');
      return res.json({ ...popular, reason: 'Log in to see personalized recommendations' });
    }
    const result = await getPersonalizedRecommendations(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/recommendations/history — get user's booking history
router.get('/history', optionalAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Please log in to view your booking history.' });
    }
    const history = await getUserBookingHistory(req.user.id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

// POST /api/recommendations/analyze — analyze need text (for debugging/preview)
router.post('/analyze', (req, res) => {
  const { need } = req.body;
  if (!need) return res.status(400).json({ error: 'need is required' });
  const result = analyzeNeed(need);
  res.json(result);
});

export default router;
