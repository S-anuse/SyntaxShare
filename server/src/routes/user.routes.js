import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public: view any user's profile by username
router.get('/:username', getProfile);

// Protected: update own profile
router.patch(
  '/me',
  protect,
  [
    body('bio').optional().isLength({ max: 300 }).withMessage('Bio must be 300 characters or less'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  ],
  updateProfile
);

export default router;
