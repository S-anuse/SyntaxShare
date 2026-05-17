import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge.jsx';

/**
 * PostCard — shown in the feed. Navigates to the post detail page on click.
 */
const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const authorInitial = post.author?.username?.[0]?.toUpperCase() || '?';
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="post-card"
      onClick={() => navigate(`/post/${post._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/post/${post._id}`)}
    >
      {/* Author info */}
      <div className="post-card__header">
        <div className="post-card__avatar">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.username} />
          ) : (
            authorInitial
          )}
        </div>
        <div>
          <div className="post-card__author-name">{post.author?.username}</div>
          <div className="post-card__date">{formattedDate}</div>
        </div>
      </div>

      {/* Title & excerpt */}
      <h2 className="post-card__title">{post.title}</h2>
      <p className="post-card__excerpt">{post.excerpt}</p>

      {/* Tags + meta */}
      <div className="post-card__footer">
        <div className="post-card__tags">
          {post.tags?.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="post-card__meta">
          <span>⏱ {post.readTime} min read</span>
          <span>❤️ {post.likes?.length ?? 0}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
