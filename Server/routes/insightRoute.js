import express from 'express';
import { createInsight, getInsightsByDocument, updateInsightTitle } from '../controllers/insightController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createInsight);
router.get('/:documentId', getInsightsByDocument);
router.put('/:id', updateInsightTitle);

export default router;
