import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';
import TagBadge from '../components/TagBadge.jsx';
import CommentSection from '../components/CommentSection.jsx';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
        setLikeCount(data.post.likes?.length ?? 0);
        if (user) {
          setLiked(data.post.likes?.some((uid) => uid === user.id));
          setBookmarked(data.post.bookmarks?.some((uid) => uid === user.id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Post not found.');
      }
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/posts/${id}/like`);
    setLiked(data.liked);
    setLikeCount(data.likeCount);
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/posts/${id}/bookmark`);
    setBookmarked(data.bookmarked);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    await api.delete(`/posts/${id}`);
    navigate('/');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (error) return (
    <div className="container--narrow" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>😕</div>
      <h2>{error}</h2>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 20 }}>Back to feed</Link>
    </div>
  );

  const isAuthor = user?.id === post.author?._id;
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const authorInitial = post.author?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="container--narrow post-detail">
      {/* Header */}
      <header className="post-detail__header">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {post.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
        <h1 className="post-detail__title">{post.title}</h1>

        <div className="post-detail__meta">
          <div className="post-detail__author">
            <div className="post-card__avatar">
              {post.author?.avatar
                ? <img src={post.author.avatar} alt={post.author.username} />
                : authorInitial}
            </div>
            <div>
              <Link
                to={`/profile/${post.author?.username}`}
                style={{ fontWeight: 600, fontSize: '0.95rem' }}
              >
                {post.author?.username}
              </Link>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {formattedDate} · ⏱ {post.readTime} min read
              </div>
            </div>
          </div>

          {/* Author-only controls */}
          {isAuthor && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Link to={`/edit/${post._id}`} className="btn btn--secondary btn--sm">✏️ Edit</Link>
              <button className="btn btn--danger btn--sm" onClick={handleDelete}>🗑 Delete</button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="post-detail__actions">
          <button
            className={`action-btn ${liked ? 'action-btn--active' : ''}`}
            onClick={handleLike}
            title={user ? 'Like this post' : 'Sign in to like'}
          >
            ❤️ {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </button>
          <button
            className={`action-btn ${bookmarked ? 'action-btn--active' : ''}`}
            onClick={handleBookmark}
            title={user ? 'Bookmark this post' : 'Sign in to bookmark'}
          >
            {bookmarked ? '🔖 Saved' : '🔖 Save'}
          </button>
        </div>
      </header>

      {/* Post content rendered as Markdown */}
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Comment section */}
      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostDetail;
