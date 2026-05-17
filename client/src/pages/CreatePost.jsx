import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import RichTextEditor from '../components/RichTextEditor.jsx';

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (publishStatus) => {
    setError('');
    if (!title.trim()) return setError('Please add a title.');
    if (!content.trim()) return setError('Please write some content.');

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const { data } = await api.post('/posts', {
        title: title.trim(),
        content,
        tags,
        status: publishStatus,
      });

      navigate(`/post/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post.');
    }
    setLoading(false);
  };

  return (
    <div className="container--narrow editor-page">
      <div className="editor-page__header">
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>New Post</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Write in Markdown — use ``` for code blocks with syntax highlighting
        </p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      <input
        className="editor-title-input"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
      />

      <input
        className="editor-tags-input"
        placeholder="Tags (comma-separated): javascript, react, algorithms"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <RichTextEditor value={content} onChange={setContent} />

      <div className="editor-controls">
        <button
          className="btn btn--secondary"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
        >
          💾 Save as Draft
        </button>
        <button
          className="btn btn--primary"
          onClick={() => handleSubmit('published')}
          disabled={loading}
        >
          🚀 Publish
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
