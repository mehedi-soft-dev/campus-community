import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';
import { api, errorMessage } from '../api/axios.js';

const STARS = [1, 2, 3, 4, 5];

// Coerce defensively: aggregates can arrive as numeric strings.
const toNumberOrNull = (value) =>
  value === null || value === undefined || value === '' ? null : Number(value);

export default function RatingPanel({ post }) {
  const { currentUser } = useAuth();

  const [myRating, setMyRating] = useState(toNumberOrNull(post.myRating));
  const [avg, setAvg] = useState(toNumberOrNull(post.ratingAvg));
  const [count, setCount] = useState(Number(post.ratingCount ?? 0));
  const [positive, setPositive] = useState(toNumberOrNull(post.positiveRatio));
  const [hover, setHover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isOwner = Boolean(currentUser) && post.uid === currentUser.id;
  const canRate = Boolean(currentUser) && !isOwner;

  const applyResult = (data) => {
    setMyRating(toNumberOrNull(data.myRating));
    setAvg(toNumberOrNull(data.ratingAvg));
    setCount(Number(data.ratingCount ?? 0));
    setPositive(toNumberOrNull(data.positiveRatio));
  };

  const rate = async (value) => {
    if (!canRate || busy) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.put(`/posts/${post.id}/rating`, { value });
      applyResult(data);
    } catch (err) {
      setError(errorMessage(err, 'Could not save your rating.'));
    } finally {
      setBusy(false);
    }
  };

  const clearRating = async () => {
    if (!canRate || busy) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.delete(`/posts/${post.id}/rating`);
      applyResult(data);
    } catch (err) {
      setError(errorMessage(err, 'Could not remove your rating.'));
    } finally {
      setBusy(false);
    }
  };

  const shown = hover ?? myRating ?? 0;
  const avgValue = avg === null ? null : Number(avg);
  const rounded = avgValue === null ? 0 : Math.round(avgValue * 2) / 2;

  return (
    <section className="rating">
      <div className="rating__score">
        <strong>{avgValue === null ? '—' : avgValue.toFixed(1)}</strong>
        <span className={`stars stars--${Math.round(rounded)}`} aria-hidden="true">
          {STARS.map((star) => (
            <span key={star} className={star <= Math.round(rounded) ? 'on' : ''}>
              ★
            </span>
          ))}
        </span>
        <span className="rating__meta">
          {count === 0
            ? 'No ratings yet'
            : `${count} rating${count === 1 ? '' : 's'}${
                positive !== null ? ` · ${Math.round(positive * 100)}% positive` : ''
              }`}
        </span>
      </div>

      <div className="rating__mine">
        {!currentUser && <p className="rating__hint">Log in to rate this post.</p>}

        {currentUser && isOwner && (
          <p className="rating__hint">This is your post, so you cannot rate it.</p>
        )}

        {canRate && (
          <>
            <span className="rating__label">
              {myRating ? `You rated this ${myRating}/5` : 'Rate this post'}
            </span>
            <div
              className="rating__input"
              onMouseLeave={() => setHover(null)}
              role="group"
              aria-label="Rate this post from 1 to 5"
            >
              {STARS.map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= shown ? 'is-on' : ''}
                  onMouseEnter={() => setHover(star)}
                  onFocus={() => setHover(star)}
                  onClick={() => rate(star)}
                  disabled={busy}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                >
                  ★
                </button>
              ))}
              {myRating && (
                <button
                  type="button"
                  className="rating__clear"
                  onClick={clearRating}
                  disabled={busy}
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}

        {error && <p className="rating__error">{error}</p>}
      </div>
    </section>
  );
}
