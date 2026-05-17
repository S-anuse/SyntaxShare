import { Router } from 'express';
import { body } from 'express-validator';
import { getReplies, createReply, deleteReply } from '../controllers/reply.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/comment/:commentId', getReplies);

router.post(
  '/comment/:commentId',
  protect,
  [body('content').trim().notEmpty().withMessage('Reply cannot be empty').isLength({ max: 1000 })],
  createReply
);

router.delete('/:id', protect, deleteReply);

export default router;
