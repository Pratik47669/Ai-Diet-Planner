import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route to handle chat messages
router.post('/chat', protect, handleChat);

export default router;
