import { Router } from 'express';
import { body } from 'express-validator';
import {
  getComments,
  createComment,
  deleteComment,
  toggleCommentLike,
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/post/:postId', getComments);

router.post(
  '/post/:postId',
  protect,
  [body('content').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 2000 })],
  createComment
);

router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
