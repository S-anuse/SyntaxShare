import { validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// ─── GET /api/posts  — Paginated public feed ──────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tag, search } = req.query;

    // Build query filter
    const filter = { status: 'published' };
    if (tag) filter.tags = tag.toLowerCase();
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username avatar')
        .select('-content -bookmarks') // exclude heavy/private fields from feed
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/posts/:id ───────────────────────────────────────────────────────
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.status === 'draft') {
      return res.status(403).json({ message: 'This post is a draft' });
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/posts ──────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, content, tags, status } = req.body;

    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      status: status || 'draft',
      author: req.user.id,
    });

    await post.populate('author', 'username avatar');
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/posts/:id ─────────────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only the author can edit
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, tags, status } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) post.status = status;

    await post.save();
    await post.populate('author', 'username avatar');

    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    // Also remove associated comments (cascade)
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/posts/:id/like — Toggle like ───────────────────────────────────
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likeCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/posts/:id/bookmark — Toggle bookmark ──────────────────────────
export const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const alreadyBookmarked = post.bookmarks.some((id) => id.toString() === userId);

    if (alreadyBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();
    res.json({ bookmarkCount: post.bookmarks.length, bookmarked: !alreadyBookmarked });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/posts/user/bookmarks ───────────────────────────────────────────
export const getBookmarks = async (req, res, next) => {
  try {
    const posts = await Post.find({ bookmarks: req.user.id, status: 'published' })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar')
      .select('-content -bookmarks')
      .lean();

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};
