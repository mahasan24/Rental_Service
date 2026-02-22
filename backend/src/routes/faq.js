import { Router } from 'express';
import { answerQuestion, getStats, reload } from '../services/faq.js';

const router = Router();

// POST /api/faq — RAG-powered question answering
router.post('/', async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'A non-empty question is required' });
    }
    if (question.trim().length > 500) {
      return res.status(400).json({ error: 'Question must be 500 characters or fewer' });
    }
    const startTime = Date.now();
    const result = await answerQuestion(question.trim());
    result.responseTimeMs = Date.now() - startTime;
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

// GET /api/faq/health — quick readiness check
router.get('/health', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json({
      status: stats.initialized ? 'ready' : 'not_initialized',
      documentCount: stats.documentCount,
      vocabularySize: stats.vocabularySize,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/faq/reload — force reload docs into vector store
router.post('/reload', async (req, res, next) => {
  try {
    const stats = await reload();
    res.json({ message: 'Vector store reloaded', ...stats });
  } catch (err) {
    next(err);
  }
});

export default router;
