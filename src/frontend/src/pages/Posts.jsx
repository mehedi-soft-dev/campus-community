import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import Pager from '../components/Pager.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import CoverArt from '../components/CoverArt.jsx';
import PostMetrics from '../components/PostMetrics.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useReveal } from '../hooks/useReveal.js';
import { initials, mediaUrl } from '../utils/media.js';

const PAGE_SIZE = 9;

const excerpt = (html = '', max = 120) => {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.replace(/[.,;:!?\s]+$/, '')}…`;
};

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const cat = searchParams.get('cat') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') === 'top' ? 'top' : 'latest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const revealRef = useReveal([status, posts]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');

    api
      .get('/posts', {
        // Page through the API rather than pulling a fixed 50 and rendering
        // them all: the API clamps pageSize at 50, so a 51st post would have
        // been unreachable.
        params: { category: cat || undefined, sort, q: q || undefined, page, pageSize: PAGE_SIZE },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setPosts(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
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
  }, [cat, q, sort, page]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.code === cat),
    [categories, cat]
  );

  // Uniform grid: one card shape, so the author-chosen banner is cropped the
  // same way in every position. See the note in _posts.scss.
  const cards = useMemo(
    () => posts.map((post) => ({ post, className: 'story' })),
    [posts]
  );

  // Changing a filter starts a new result set, so drop back to page 1.
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : 'All posts';

  usePageTitle(heading);

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Community</p>
        <h1>{heading}</h1>
        <p className="hub__lede">
          {q
            ? `${total} post${total === 1 ? '' : 's'} matching your search.`
            : activeCategory?.description ||
              'Everything students and staff have published, newest first.'}
        </p>
      </header>

      <div className="hub__filters">
        <button
          type="button"
          className={`chip ${!cat ? 'chip--active' : ''}`}
          onClick={() => updateParam('cat', '')}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`chip ${cat === category.code ? 'chip--active' : ''}`}
            style={{ '--hue': category.accentHue }}
            onClick={() => updateParam('cat', category.code)}
          >
            {category.name}
          </button>
        ))}

        <span className="spacer" />

        <div className="toggle">
          <button
            type="button"
            className={sort === 'latest' ? 'on' : ''}
            onClick={() => updateParam('sort', '')}
          >
            Latest
          </button>
          <button
            type="button"
            className={sort === 'top' ? 'on' : ''}
            onClick={() => updateParam('sort', 'top')}
          >
            Top rated
          </button>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading posts…" rows={4} />}

      {status === 'ready' && posts.length === 0 && (
        <div className="empty-state">
          <h2>No posts found</h2>
          <p>
            {q ? 'Try a different search term.' : 'Nothing has been published in this category yet.'}
          </p>
        </div>
      )}

      {status === 'ready' && posts.length > 0 && (
        <div className="feed fade-swap">
          <div className="posts-grid">
            {cards.map(({ post, className }) => (
              <article
                className={className}
                key={post.id}
                data-reveal
                style={{ '--hue': post.categoryHue ?? 220 }}
              >
                {post.img ? (
                  <Link to={`/post/${post.id}`} className="story__media">
                    <img src={mediaUrl(post.img)} alt="" loading="lazy" />
                  </Link>
                ) : (
                  <Link
                    to={`/post/${post.id}`}
                    className="story__media"
                    style={{ '--hue': post.categoryHue ?? 220 }}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <CoverArt hue={post.categoryHue ?? 220} variant={post.id} />
                  </Link>
                )}

                <div className="story__body">
                  <Link to={`/posts?cat=${post.categoryCode}`} className="card__cat">
                    {post.categoryName}
                  </Link>
                  <h3>
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p>{excerpt(post.desc, post.img ? 130 : 190)}</p>
                  <PostMetrics post={post} showViews={false} />
                  <div className="card__by">
                    <span className="card__avatar">
                      {post.userImg ? (
                        <img src={mediaUrl(post.userImg)} alt="" />
                      ) : (
                        initials(post.username)
                      )}
                    </span>
                    <span>{post.username}</span>
                    <span className="card__by-dot">·</span>
                    <time dateTime={post.date}>{moment(post.date).fromNow()}</time>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pager
            page={page}
            totalPages={totalPages}
            onChange={(next) => updateParam('page', next === 1 ? '' : String(next))}
            label="Post pages"
          />
        </div>
      )}
    </div>
  );
}
