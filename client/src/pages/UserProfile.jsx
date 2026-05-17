import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';
import PostCard from '../components/PostCard.jsx';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data.user);
        setPosts(data.posts);
        setForm({ bio: data.user.bio || '', avatar: data.user.avatar || '' });
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', form);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!profile) return (
    <div className="container--narrow" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-text-muted)' }}>User not found</h2>
    </div>
  );

  const initial = profile.username?.[0]?.toUpperCase() || '?';
  const joined = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="container--narrow profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.username} />
            : initial}
        </div>

        <div style={{ flex: 1 }}>
          <div className="profile-name">@{profile.username}</div>

          {editing ? (
            <>
              <textarea
                className="form-input"
                style={{ width: '100%', marginTop: 8, resize: 'vertical' }}
                rows={3}
                placeholder="Tell the community about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={300}
              />
              <input
                className="form-input"
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Avatar URL"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <p className="profile-joined">Joined {joined}</p>
              {isOwnProfile && (
                <button
                  className="btn btn--secondary btn--sm"
                  style={{ marginTop: 10 }}
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Posts */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
        Published Posts ({posts.length})
      </h2>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">✍️</div>
          <div className="empty-state__title">No posts yet</div>
          {isOwnProfile && (
            <Link to="/create" className="btn btn--primary" style={{ marginTop: 16 }}>
              Write your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="feed__grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, author: profile }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
