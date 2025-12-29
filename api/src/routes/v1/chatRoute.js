import express from 'express';
import { chatController } from '../../controllers/chatController.js';

const router = express.Router();

// POST /api/v1/chat
router.post('/', chatController.handleChat);

export default router;
