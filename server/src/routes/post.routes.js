import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarks,
} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// ⚠️  Static route must come before /:id to avoid conflicts
router.get('/user/bookmarks', protect, getBookmarks);

router.get('/', getFeed);
router.get('/:id', getPost);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
    body('content').notEmpty().withMessage('Content is required'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  ],
  createPost
);

router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
