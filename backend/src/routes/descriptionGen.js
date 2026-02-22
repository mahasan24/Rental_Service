import { Router } from 'express';
import { generateDescription, generateMissingDescriptions } from '../services/descriptionGen.js';

const router = Router();

// POST /api/describe/:id — generate description for a specific van
router.post('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const save = req.body.save === true;
    const result = await generateDescription(id, { save });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/describe/batch/missing — generate descriptions for all vans without one
router.post('/batch/missing', async (req, res, next) => {
  try {
    const result = await generateMissingDescriptions();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
