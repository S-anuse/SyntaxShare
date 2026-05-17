import mongoose from 'mongoose';

/**
 * Estimate reading time: ~200 words per minute.
 * Strip Markdown syntax before counting words.
 */
const estimateReadTime = (content = '') => {
  const text = content.replace(/[#*_`~>\[\]()!]/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    // Short teaser shown on post cards (auto-generated from content)
    excerpt: {
      type: String,
      maxlength: 200,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      // Normalize tags to lowercase on save
      set: (tags) => tags.map((t) => t.toLowerCase().trim()),
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    // Estimated read time in minutes, recomputed on every save
    readTime: {
      type: Number,
      default: 1,
    },
    // Arrays of user IDs — toggle-style (add if not present, remove if present)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Auto-compute excerpt and readTime before every save
postSchema.pre('save', function (next) {
  this.readTime = estimateReadTime(this.content);

  if (!this.excerpt || this.isModified('content')) {
    // Strip markdown, take first 160 characters
    const plain = this.content.replace(/[#*_`~>\[\]()!]/g, '').trim();
    this.excerpt = plain.substring(0, 160) + (plain.length > 160 ? '…' : '');
  }

  next();
});

// Virtual: total like count
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual: total bookmark count
postSchema.virtual('bookmarkCount').get(function () {
  return this.bookmarks.length;
});

// Index for efficient feed queries (published posts, sorted by recency)
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });

export default mongoose.model('Post', postSchema);
