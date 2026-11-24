import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import DOMPurify from 'dompurify';
import { api, errorMessage } from '../api/axios.js';
import Menu from '../components/Menu.jsx';
import Loading from '../components/Loading.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import PostMetrics from '../components/PostMetrics.jsx';
import RatingPanel from '../components/RatingPanel.jsx';
import Comments from '../components/Comments.jsx';
import { useAuth } from '../context/authContext.jsx';
import { initials, mediaUrl } from '../utils/media.js';

export default function Single() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Settles on the post title once it loads.
  usePageTitle(post?.title);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');

    api
      .get(`/posts/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setPost(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load this post.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Ownership is decided by uid, not by username: two accounts can share a
  // display name, and comparing usernames breaks as soon as you are logged out.
  const isOwner = Boolean(currentUser) && post?.uid === currentUser.id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    setDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Could not delete this post.'));
      setDeleting(false);
    }
  };

  if (status !== 'ready') {
    return (
      <div className="single">
        <div className="single__content">
          {status === 'loading' ? (
            <Loading label="Loading post…" rows={4} />
          ) : (
            <div className="empty-state">
              <h1>{error}</h1>
              <Link className="btn btn--primary" to="/">
                Back to all posts
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const avatar = mediaUrl(post.userImg);

  return (
    <div className="single">
      <article className="single__content fade-swap">
        {error && <div className="banner banner--error">{error}</div>}

        <Link
          to={`/posts?cat=${post.categoryCode}`}
          className="chip chip--active"
          style={{ '--hue': post.categoryHue ?? 220 }}
        >
          {post.categoryName}
        </Link>

        <h1 className="single__title">{post.title}</h1>

        <div className="single__byline">
          <span className="single__avatar">
            {avatar ? <img src={avatar} alt="" /> : <span>{initials(post.username)}</span>}
          </span>
          <div className="single__author">
            <strong>{post.username}</strong>
            <span>Posted {moment(post.date).fromNow()}</span>
          </div>

          {isOwner && (
            <div className="single__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => navigate('/write?edit=2', { state: post })}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="btn__icon">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Edit
              </button>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="btn__icon">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <PostMetrics post={post} />

        <div className="single__cover" style={{ '--hue': post.categoryHue ?? 220 }}>
          {post.img ? (
            <img src={mediaUrl(post.img)} alt="" />
          ) : (
            <span className="single__cover-fallback">{post.categoryName}</span>
          )}
        </div>

        {/* Sanitized on write by the API and again here before rendering. */}
        <div
          className="single__body"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.desc ?? '') }}
        />

        <RatingPanel post={post} />
        <Comments postId={post.id} />
      </article>

      <Menu cat={post.categoryCode} />
    </div>
  );
}
