import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';
import Loading from '../components/Loading.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Dashboard from './admin/Dashboard.jsx';
import Categories from './admin/Categories.jsx';
import Departments from './admin/Departments.jsx';
import Notices from './admin/Notices.jsx';
import Routines from './admin/Routines.jsx';
import Events from './admin/Events.jsx';
import Materials from './admin/Materials.jsx';
import Users from './admin/Users.jsx';

// `adminOnly` mirrors the API guards exactly: categories and departments are
// requireAdmin on the server, the rest are requireStaff. Hiding a tab a
// moderator cannot use is a courtesy; the 403 is the actual enforcement.
const TABS = [
  { key: 'dashboard', label: 'Dashboard', Component: Dashboard },
  { key: 'notices', label: 'Notices', Component: Notices },
  { key: 'routines', label: 'Routines', Component: Routines },
  { key: 'events', label: 'Events', Component: Events },
  { key: 'materials', label: 'Materials', Component: Materials },
  { key: 'users', label: 'Users', Component: Users },
  { key: 'categories', label: 'Categories', Component: Categories, adminOnly: true },
  { key: 'departments', label: 'Departments', Component: Departments, adminOnly: true },
];

export default function Admin() {
  const { tab } = useParams();
  const { currentUser, loading } = useAuth();

  usePageTitle(tab ? `Admin · ${tab}` : 'Admin');

  if (loading) return <Loading label="Checking your access…" rows={2} />;

  // No session, or an ordinary member: this area does not exist for them.
  if (!currentUser) {
    return (
      <div className="hub">
        <div className="empty-state">
          <h2>Sign in first</h2>
          <p>The admin area belongs to staff accounts, and you are not signed in.</p>
          <Link className="btn btn--primary" to="/login">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  // A member account is the most likely reason someone "cannot add" anything,
  // so say exactly which account is signed in and what it needs.
  if (currentUser.role === 'user') {
    return (
      <div className="hub">
        <div className="empty-state">
          <h2>Staff only</h2>
          <p>
            You are signed in as <strong>{currentUser.username}</strong>, which is a member
            account. Publishing or editing notices, routines, events and materials needs a{' '}
            <strong>moderator</strong> or <strong>administrator</strong> account.
          </p>
          <p className="admin-note">
            The demo logins are listed in the README — log out and back in as one of those to get
            the Admin link in the header.
          </p>
          <Link className="btn btn--primary" to="/">
            Back to the front page
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const visible = TABS.filter((item) => !item.adminOnly || isAdmin);
  const active = visible.find((item) => item.key === tab);

  if (!active) return <Navigate to={`/admin/${visible[0].key}`} replace />;

  const { Component } = active;

  return (
    <div className="admin">
      <header className="admin__head">
        <p className="eyebrow">Staff area</p>
        <h1>Admin</h1>
        <p className="admin__who">
          Signed in as <strong>{currentUser.username}</strong> ({currentUser.role}
          {isAdmin ? '' : ' — content only, categories and departments need an admin'})
        </p>
      </header>

      <nav className="admin__tabs" aria-label="Admin sections">
        {visible.map((item) => (
          <NavLink
            key={item.key}
            to={`/admin/${item.key}`}
            className={({ isActive }) => `admin__tab ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Component />
    </div>
  );
}
