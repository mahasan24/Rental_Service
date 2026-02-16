import { Router } from 'express';
import { answerQuestion, getStats, reload } from '../services/faq.js';

const router = Router();

// POST /api/faq — ask a question
router.post('/', async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'A non-empty question is required' });
    }
    const result = await answerQuestion(question.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/faq/stats — vector store stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// POST /api/faq/reload — force reload docs
router.post('/reload', async (req, res, next) => {
  try {
    const stats = await reload();
    res.json({ message: 'Vector store reloaded', ...stats });
  } catch (err) {
    next(err);
  }
});

export default router;
