import { validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import Reply from '../models/Reply.js';

// ─── GET /api/comments/post/:postId ──────────────────────────────────────────
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar')
      .lean();

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/comments/post/:postId ─────────────────────────────────────────
export const createComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user.id,
      content: req.body.content,
    });

    await comment.populate('author', 'username avatar');
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/comments/:id ─────────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    // Cascade delete all replies to this comment
    await Reply.deleteMany({ comment: req.params.id });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/comments/:id/like ─────────────────────────────────────────────
export const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user.id;
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likeCount: comment.likes.length, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};
