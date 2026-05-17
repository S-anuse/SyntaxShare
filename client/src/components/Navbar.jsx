import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Get initials for avatar fallback
  const initials = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          Syntax<span>Share</span>
        </Link>

        {/* Search bar */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <span className="navbar__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search posts, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
          />
        </form>

        <div className="navbar__actions">
          <ThemeToggle />

          {user ? (
            <>
              {/* Write button */}
              <Link to="/create" className="btn btn--primary btn--sm">
                ✏️ Write
              </Link>

              {/* User dropdown */}
              <div className="user-menu" ref={menuRef}>
                <button
                  className="user-menu__trigger"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Open user menu"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    initials
                  )}
                </button>

                {menuOpen && (
                  <div className="user-menu__dropdown">
                    <Link
                      to={`/profile/${user.username}`}
                      className="user-menu__item"
                      onClick={() => setMenuOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      to="/bookmarks"
                      className="user-menu__item"
                      onClick={() => setMenuOpen(false)}
                    >
                      🔖 Bookmarks
                    </Link>
                    <div className="user-menu__divider" />
                    <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
                      🚪 Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Sign in</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
