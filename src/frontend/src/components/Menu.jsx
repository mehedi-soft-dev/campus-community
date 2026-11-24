import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/axios.js';
import CoverArt from './CoverArt.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { mediaUrl } from '../utils/media.js';

export default function Menu({ cat }) {
  const { categories } = useCategories();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get('/posts', { params: { pageSize: 12 } })
      .then(({ data }) => {
        if (cancelled) return;
        setPosts(data.items ?? []);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load posts.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Prefer more from the category you are reading, then fall back to the rest.
  const recommended = cat
    ? [
        ...posts.filter((post) => post.categoryCode === cat),
        ...posts.filter((post) => post.categoryCode !== cat),
      ]
    : posts;

  return (
    <aside className="menu">
      <section className="menu__block">
        <h3>Discover by category</h3>
        <ul className="menu__categories">
          {categories.map((category) => (
            <li key={category.id}>
              {/* Category browsing lives on /posts now — the home page no longer
                  reads a ?cat= parameter, so these used to go nowhere. */}
              <Link
                to={`/posts?cat=${category.code}`}
                // "Active" means the category of the post being read, since a
                // post page has no cat query parameter of its own.
                className={cat === category.code ? 'is-active' : undefined}
                style={{ '--hue': category.accentHue }}
              >
                <span className="menu__dot" />
                <span className="menu__cat-name">{category.name}</span>
                <span className="menu__count">{category.postCount ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="menu__block">
        <h3>{cat ? 'More like this' : 'Latest posts'}</h3>

        {status === 'loading' && <p className="menu__note">Loading…</p>}
        {status === 'error' && <p className="menu__note menu__note--error">{error}</p>}
        {status === 'ready' && recommended.length === 0 && (
          <p className="menu__note">Nothing here yet.</p>
        )}

        <ul className="menu__posts">
          {recommended.slice(0, 4).map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>
                <span
                  className="menu__thumb"
                  style={{ '--hue': post.categoryHue ?? 220 }}
                  aria-hidden="true"
                >
                  {post.img ? (
                    <img src={mediaUrl(post.img)} alt="" loading="lazy" />
                  ) : (
                    <CoverArt hue={post.categoryHue ?? 220} variant={post.id} />
                  )}
                </span>
                <span className="menu__post-title">{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
