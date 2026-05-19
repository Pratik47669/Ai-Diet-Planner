import express from 'express';
import { createOrUpdateProfile, getProfile, deleteProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { profileValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

router.use(protect); // All profile routes require authentication

router.route('/')
  .get(getProfile)
  .post(profileValidation, validateRequest, createOrUpdateProfile)
  .delete(deleteProfile);

export default router;