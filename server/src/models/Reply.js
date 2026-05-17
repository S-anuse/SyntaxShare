import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

replySchema.index({ comment: 1, createdAt: 1 });

export default mongoose.model('Reply', replySchema);
