import express from 'express';
import {
  getBMITrend,
  getCaloriesTrend,
  getDietFrequency,
  getStats
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All analytics routes require authentication

router.get('/bmi-trend', getBMITrend);
router.get('/calories-trend', getCaloriesTrend);
router.get('/diet-frequency', getDietFrequency);
router.get('/stats', getStats);

export default router;