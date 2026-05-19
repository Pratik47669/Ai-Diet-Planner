import express from 'express';
import {
  generateDietPlan,
  getDietHistory,
  getDietPlanById,
  deleteDietPlan,
  toggleFavorite
} from '../controllers/dietController.js';
import { protect } from '../middleware/auth.js';
import { dietGenerationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect); // All diet routes require authentication

router.post('/generate', dietGenerationLimiter, generateDietPlan);
router.get('/history', getDietHistory);
router.get('/:id', getDietPlanById);
router.delete('/:id', deleteDietPlan);
router.patch('/:id/favorite', toggleFavorite);

export default router;