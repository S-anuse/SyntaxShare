import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';
import RichTextEditor from '../components/RichTextEditor.jsx';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        const { post } = data;

        // Redirect non-authors away
        if (post.author?._id !== user?.id) {
          navigate('/');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setTagsInput(post.tags?.join(', ') || '');
        setStatus(post.status);
      } catch {
        setError('Post not found.');
      }
      setLoading(false);
    };
    fetch();
  }, [id, user, navigate]);

  const handleSave = async (newStatus) => {
    setError('');
    setSaving(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const { data } = await api.patch(`/posts/${id}`, { title, content, tags, status: newStatus });
      navigate(`/post/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="container--narrow editor-page">
      <div className="editor-page__header">
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Edit Post</h1>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      <input
        className="editor-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
      />

      <input
        className="editor-tags-input"
        placeholder="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <RichTextEditor value={content} onChange={setContent} />

      <div className="editor-controls">
        <button className="btn btn--secondary" onClick={() => handleSave('draft')} disabled={saving}>
          💾 Save as Draft
        </button>
        <button className="btn btn--primary" onClick={() => handleSave('published')} disabled={saving}>
          🚀 Publish
        </button>
      </div>
    </div>
  );
};

export default EditPost;
