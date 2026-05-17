import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';
import CommentItem from './CommentItem.jsx';

/**
 * CommentSection — loads and renders comments for a post.
 * Handles adding new comments and cascade-deleting comments from local state.
 */
const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/comments/post/${postId}`);
        setComments(data.comments);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/comments/post/${postId}`, { content: text });
      setComments((prev) => [...prev, data.comment]);
      setText('');
    } catch {}
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {}
  };

  return (
    <section className="comments">
      <h2 className="comments__title">💬 {comments.length} Comments</h2>

      {/* Add comment form */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Write a comment"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--primary btn--sm">
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          <a href="/login" style={{ color: 'var(--color-accent)' }}>Sign in</a> to join the discussion.
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <div className="empty-state__title">No comments yet</div>
          <p>Be the first to share your thoughts!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={postId}
            onDelete={handleDelete}
          />
        ))
      )}
    </section>
  );
};

export default CommentSection;
