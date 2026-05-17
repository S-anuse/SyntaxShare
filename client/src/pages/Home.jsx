import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import PostCard from '../components/PostCard.jsx';
import TagBadge from '../components/TagBadge.jsx';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 10 };
        if (currentTag) params.tag = currentTag;
        if (currentSearch) params.search = currentSearch;

        const [postsRes, tagsRes] = await Promise.all([
          api.get('/posts', { params }),
          api.get('/tags'),
        ]);

        setPosts(postsRes.data.posts);
        setPagination(postsRes.data.pagination);
        setTags(tagsRes.data.tags.slice(0, 20)); // top 20 tags in sidebar
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentPage, currentTag, currentSearch]);

  const handleTagClick = (tag) => {
    setSearchParams({ tag, page: '1' });
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', page);
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container feed">
      {/* Active filters */}
      {(currentTag || currentSearch) && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Filtering by:{' '}
            {currentTag && <strong>#{currentTag}</strong>}
            {currentSearch && <strong>"{currentSearch}"</strong>}
          </span>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setSearchParams({})}
          >
            ✕ Clear
          </button>
        </div>
      )}

      <div className="feed__layout">
        {/* Posts grid */}
        <div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <div className="empty-state__title">No posts found</div>
              <p>Try a different search or tag.</p>
            </div>
          ) : (
            <div className="feed__grid">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="feed__sidebar">
          <div className="sidebar-card">
            <h3>Popular Tags</h3>
            <div className="sidebar-tags">
              {tags.map(({ tag, count }) => (
                <span key={tag} onClick={() => handleTagClick(tag)} style={{ cursor: 'pointer' }}>
                  <TagBadge tag={`${tag} (${count})`} />
                </span>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>About SyntaxShare</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              A platform where developers share knowledge through articles and code snippets.
              From beginners to senior engineers — all voices welcome.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
