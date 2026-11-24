import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="empty-state">
      <p className="empty-state__code">404</p>
      <h1>We couldn&apos;t find that page</h1>
      <p>The link may be broken, or the post may have been deleted.</p>
      <Link className="btn btn--primary" to="/">
        Back to all posts
      </Link>
    </div>
  );
}
