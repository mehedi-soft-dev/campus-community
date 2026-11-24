/**
 * Engagement numbers for a post, shared by the front page, the listing grid and
 * the post page so the same figures are always described the same way.
 *
 * Ratings stand in for "likes" here: a post has a 1-5 rating (one per person)
 * rather than a separate like button, so the count next to the star is the
 * number of people who rated it.
 */
export default function PostMetrics({ post, showViews = true }) {
  const count = Number(post.ratingCount ?? 0);
  const average = Number(post.ratingAvg ?? 0);
  const comments = Number(post.commentCount ?? 0);
  const views = Number(post.views ?? 0);

  return (
    <p className="metrics">
      <span
        className={`metrics__item metrics__rating ${count ? '' : 'metrics__empty'}`}
        title={count ? `${average.toFixed(1)} out of 5 from ${count} rating${count === 1 ? '' : 's'}` : 'Not rated yet'}
      >
        <span className="metrics__star" aria-hidden="true">
          ★
        </span>
        {count ? (
          <>
            <strong>{average.toFixed(1)}</strong>
            <span className="metrics__sub">({count})</span>
          </>
        ) : (
          <span className="metrics__sub">Not rated</span>
        )}
      </span>

      <span className="metrics__item">
        <strong>{comments}</strong>
        <span className="metrics__sub">{comments === 1 ? 'comment' : 'comments'}</span>
      </span>

      {showViews && (
        <span className="metrics__item">
          <strong>{views}</strong>
          <span className="metrics__sub">{views === 1 ? 'view' : 'views'}</span>
        </span>
      )}
    </p>
  );
}
