import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories.js';
import { useAuth } from '../context/authContext.jsx';
import { errorMessage } from '../api/axios.js';

export default function Footer() {
  const { categories } = useCategories();
  const { currentUser, loading, logout } = useAuth();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
    } catch (err) {
      setError(errorMessage(err, 'Could not log out.'));
    }
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo-plate">
            <img src="/uni_logo.png" alt="University of South Asia" />
          </span>
          <p>
            A community portal for the University of South Asia — where students and faculty
            publish class notes, project write-ups, notices and campus life.
          </p>
        </div>

        <nav className="footer__nav">
          <h3>Browse</h3>
          <ul>
            <li>
              <Link to="/">All posts</Link>
            </li>
            <li>
              <Link to="/notices">Notices</Link>
            </li>
            <li>
              <Link to="/routine">Exam routine</Link>
            </li>
            <li>
              <Link to="/calendar">Calendar</Link>
            </li>
            <li>
              <Link to="/materials">Study materials</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer__nav">
          <h3>Your account</h3>

          {/* Rendered only once the session is known, so there is no flash of
              "Log in" for someone who is already signed in. */}
          {!loading && (
            <ul>
              {currentUser ? (
                <>
                  <li>
                    <Link to="/write">Write a post</Link>
                  </li>
                  <li>
                    <span className="footer__who">Signed in as {currentUser.username}</span>
                  </li>
                  <li>
                    <button type="button" className="footer__logout" onClick={handleLogout}>
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Log in</Link>
                  </li>
                  <li>
                    <Link to="/register">Create an account</Link>
                  </li>
                </>
              )}
            </ul>
          )}

          {error && <p className="footer__error">{error}</p>}
        </nav>

        <nav className="footer__nav">
          <h3>Categories</h3>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/?cat=${category.code}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} University of South Asia · Community Portal</span>
        <span className="footer__disclaimer">
          Student project — not an official university service.
        </span>
      </div>
    </footer>
  );
}
