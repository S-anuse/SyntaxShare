import { validationResult } from 'express-validator';
import Reply from '../models/Reply.js';
import Comment from '../models/Comment.js';

// ─── GET /api/replies/comment/:commentId ─────────────────────────────────────
export const getReplies = async (req, res, next) => {
  try {
    const replies = await Reply.find({ comment: req.params.commentId })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar')
      .lean();

    res.json({ replies });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/replies/comment/:commentId ────────────────────────────────────
export const createReply = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = await Reply.create({
      comment: req.params.commentId,
      author: req.user.id,
      content: req.body.content,
    });

    // Increment the parent comment's replyCount
    comment.replyCount += 1;
    await comment.save();

    await reply.populate('author', 'username avatar');
    res.status(201).json({ reply });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/replies/:id ──────────────────────────────────────────────────
export const deleteReply = async (req, res, next) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    if (reply.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    await reply.deleteOne();

    // Decrement the parent comment's replyCount
    await Comment.findByIdAndUpdate(reply.comment, { $inc: { replyCount: -1 } });

    res.json({ message: 'Reply deleted' });
  } catch (err) {
    next(err);
  }
};
