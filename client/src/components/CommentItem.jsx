import { useState } from 'react';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';

/**
 * CommentItem — renders a single comment and its inline reply section.
 */
const CommentItem = ({ comment, postId, onDelete }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(
    user ? comment.likes?.some((id) => id === user.id) : false
  );
  const [likeCount, setLikeCount] = useState(comment.likes?.length ?? 0);
  const [replyCount, setReplyCount] = useState(comment.replyCount ?? 0);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    try {
      const { data } = await api.post(`/comments/${comment._id}/like`);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const fetchReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoadingReplies(true);
    try {
      const { data } = await api.get(`/replies/comment/${comment._id}`);
      setReplies(data.replies);
      setShowReplies(true);
    } catch {}
    setLoadingReplies(false);
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post(`/replies/comment/${comment._id}`, {
        content: replyText,
      });
      setReplies((prev) => [...prev, data.reply]);
      setReplyCount((n) => n + 1);
      setReplyText('');
    } catch {}
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await api.delete(`/replies/${replyId}`);
      setReplies((prev) => prev.filter((r) => r._id !== replyId));
      setReplyCount((n) => Math.max(0, n - 1));
    } catch {}
  };

  const authorInitial = comment.author?.username?.[0]?.toUpperCase() || '?';
  const timeAgo = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="comment-item">
      {/* Avatar */}
      <div className="post-card__avatar" style={{ width: 36, height: 36 }}>
        {comment.author?.avatar ? (
          <img src={comment.author.avatar} alt={comment.author.username} />
        ) : (
          authorInitial
        )}
      </div>

      <div className="comment-item__body">
        <div className="comment-item__header">
          <span className="comment-item__name">{comment.author?.username}</span>
          <span className="comment-item__time">{timeAgo}</span>
        </div>

        <p className="comment-item__content">{comment.content}</p>

        <div className="comment-item__actions">
          {/* Like button */}
          <button
            className={`comment-item__action ${liked ? 'comment-item__action--active' : ''}`}
            onClick={handleLike}
          >
            ❤️ {likeCount}
          </button>

          {/* Toggle replies */}
          <button className="comment-item__action" onClick={fetchReplies} disabled={loadingReplies}>
            💬 {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </button>

          {/* Delete own comment */}
          {user?.id === comment.author?._id && (
            <button
              className="comment-item__action"
              style={{ color: 'var(--color-danger)' }}
              onClick={() => onDelete(comment._id)}
            >
              🗑 Delete
            </button>
          )}
        </div>

        {/* Replies */}
        {showReplies && (
          <div className="replies">
            {replies.map((reply) => {
              const rInitial = reply.author?.username?.[0]?.toUpperCase() || '?';
              return (
                <div key={reply._id} className="comment-item" style={{ marginBottom: 12 }}>
                  <div className="post-card__avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                    {reply.author?.avatar ? (
                      <img src={reply.author.avatar} alt={reply.author.username} />
                    ) : rInitial}
                  </div>
                  <div className="comment-item__body">
                    <div className="comment-item__header">
                      <span className="comment-item__name">{reply.author?.username}</span>
                    </div>
                    <p className="comment-item__content">{reply.content}</p>
                    {user?.id === reply.author?._id && (
                      <button
                        className="comment-item__action"
                        style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteReply(reply._id)}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add reply form */}
            {user && (
              <form onSubmit={handleAddReply} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  className="form-input"
                  style={{ flex: 1, padding: '7px 12px' }}
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn btn--primary btn--sm">Reply</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
