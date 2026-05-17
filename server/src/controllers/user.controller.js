import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Post from '../models/Post.js';

// ─── Get Public Profile ───────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-refreshToken'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch published posts by this author, newest first
    const posts = await Post.find({ author: user._id, status: 'published' })
      .sort({ createdAt: -1 })
      .select('title excerpt tags readTime likes createdAt')
      .lean();

    res.json({ user, posts });
  } catch (err) {
    next(err);
  }
};

// ─── Update Own Profile ───────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-refreshToken');

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
