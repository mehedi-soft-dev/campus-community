import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchBox from './SearchBox.jsx';
import { useAuth } from '../context/authContext.jsx';
import { useQuestionStats } from '../hooks/useQuestionStats.js';
import { errorMessage } from '../api/axios.js';
import { initials, mediaUrl } from '../utils/media.js';

export default function Navbar() {
  const { currentUser, loading, logout } = useAuth();
  const stats = useQuestionStats();
  const navigate = useNavigate();
  const location = useLocation();

  const userRef = useRef(null);
  const avatarRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  // Close the account menu on an outside click or Escape. `pointerdown` covers
  // mouse and touch; listening on the container means clicking the avatar
  // itself is not treated as "outside".
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        avatarRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // Also close it when navigating, e.g. clicking a section link while open.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      setMenuOpen(false);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Could not log out.'));
    }
  };

  const avatar = mediaUrl(currentUser?.img);
  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  return (
    <header className="navbar">
      <div className="navbar__utility">
        <div className="inner">
          <b>University of South Asia</b>
          <span>Community Portal</span>
        </div>
      </div>

      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Community home">
          <img className="navbar__logo" src="/uni_logo.png" alt="University of South Asia" />
        </Link>

        <nav className="navbar__links" aria-label="Sections">
          {[
            ['/posts', 'Posts'],
            ['/notices', 'Notices'],
            ['/routine', 'Routine'],
            ['/calendar', 'Calendar'],
            ['/materials', 'Materials'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'navbar__link is-active' : 'navbar__link')}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Search: live suggestions, keyboard nav, "/" shortcut. */}
        <SearchBox />

        <nav className="navbar__actions">
          {/* Sits immediately right of the search field. The badge is the count
              of questions nobody has answered yet. Links to the list rather
              than straight into the form. */}
          <NavLink
            to="/questions"
            className="navbar__qa"
            aria-label={
              stats.unanswered > 0
                ? `Ask a question. ${stats.unanswered} question${stats.unanswered === 1 ? '' : 's'} still need an answer.`
                : 'Ask a question'
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="navbar__qa-icon">
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.6-4.6A8.4 8.4 0 1 1 21 11.5Z" />
            </svg>
            <span className="navbar__qa-label">Ask</span>
            {stats.unanswered > 0 && (
              <span className="navbar__badge" aria-hidden="true">
                {stats.unanswered > 99 ? '99+' : stats.unanswered}
              </span>
            )}
          </NavLink>

          {/* Staff-only entry to the admin area. The API enforces the real
              check; this just avoids showing a door that will not open. */}
          {isStaff && (
            <NavLink to="/admin" className="navbar__qa">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="navbar__qa-icon">
                <path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3Z" />
              </svg>
              <span className="navbar__qa-label">Admin</span>
            </NavLink>
          )}

          {currentUser && (
            <Link to="/write" className="btn btn--primary btn--sm">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="btn__icon">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write
            </Link>
          )}

          {loading ? (
            <span className="navbar__avatar navbar__avatar--skeleton" aria-hidden="true" />
          ) : currentUser ? (
            <div className="navbar__user" ref={userRef}>
              <button
                type="button"
                ref={avatarRef}
                className="navbar__avatar"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title={currentUser.username}
              >
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  <span>{initials(currentUser.username)}</span>
                )}
              </button>

              {menuOpen && (
                <div className="navbar__menu" role="menu">
                  <p className="navbar__menu-name">@{currentUser.username}</p>
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Log in
              </Link>
              <Link to="/register" className="btn btn--ghost btn--sm">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>

      {error && <p className="navbar__error">{error}</p>}
    </header>
  );
}
