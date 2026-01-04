import express from 'express';
import {
  getFlashcards,
  getAllFlashcardSets,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from '../controllers/flashcardController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllFlashcardSets);
router.get('/:documentId', getFlashcards);
router.put('/:cardId/star', toggleStarFlashcard);
router.delete('/:id', deleteFlashcardSet);

export default router;