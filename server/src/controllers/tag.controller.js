import Post from '../models/Post.js';

// ─── GET /api/tags ────────────────────────────────────────────────────────────
// Returns all unique tags aggregated from published posts with their counts
export const getTags = async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    res.json({ tags });
  } catch (err) {
    next(err);
  }
};
