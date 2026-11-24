import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';

/**
 * Staff-only shortcut from a public board to the admin tab that manages it.
 *
 * These boards are read-only for everyone else, so without this a moderator
 * landing on /notices has no visible way to publish one — the admin area might
 * as well not exist. The API still enforces the real permission.
 */
export default function AdminLink({ to, children = 'Manage in admin' }) {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role === 'user') return null;

  return (
    <p className="hub__admin">
      <Link to={to}>{children} →</Link>
    </p>
  );
}
