import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import PostCard from '../components/PostCard.jsx';

const Bookmarks = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/posts/user/bookmarks');
        setPosts(data.posts);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="container--narrow" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
        🔖 Your Reading List
      </h1>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔖</div>
          <div className="empty-state__title">No bookmarks yet</div>
          <p>Save posts to read them later — just click the bookmark button on any post.</p>
        </div>
      ) : (
        <div className="feed__grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
