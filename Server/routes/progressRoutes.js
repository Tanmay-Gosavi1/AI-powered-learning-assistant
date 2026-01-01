import express from 'express';
const router = express.Router();
import protect from '../middlewares/auth.js';
import { getDashboard } from '../controllers/progressController.js';

router.use(protect);

router.get('/dashboard' , getDashboard)

export default router;