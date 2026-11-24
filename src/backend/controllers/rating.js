import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';

async function loadPost(id) {
  const [post] = await query('SELECT id, uid, status FROM posts WHERE id = ? LIMIT 1', [id]);
  if (!post || post.status !== 'published') throw ApiError.notFound('Post not found!');
  return post;
}

async function ratingSummary(postId) {
  const [stats] = await query(
    `SELECT COUNT(*) AS ratingCount, AVG(value) AS ratingAvg,
            (SUM(value >= 4) / NULLIF(COUNT(*), 0)) AS positiveRatio
       FROM post_ratings WHERE post_id = ?`,
    [postId]
  );
  return {
    ratingCount: Number(stats.ratingCount ?? 0),
    ratingAvg: stats.ratingAvg === null ? null : Number(stats.ratingAvg),
    positiveRatio: stats.positiveRatio === null ? null : Number(stats.positiveRatio),
  };
}

export async function setRating(req, res) {
  const { id } = req.validated.params;
  const { value } = req.validated.body;

  const post = await loadPost(id);
  if (post.uid === req.user.id) {
    throw new ApiError(403, 'You cannot rate your own post.', 'SELF_RATING');
  }

  // Composite PK (post_id, user_id) makes this one row per user per post.
  await query(
    `INSERT INTO post_ratings (post_id, user_id, value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [id, req.user.id, value]
  );

  res.json({ postId: Number(id), myRating: value, ...(await ratingSummary(id)) });
}

export async function removeRating(req, res) {
  const { id } = req.validated.params;
  await loadPost(id);

  await query('DELETE FROM post_ratings WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
  res.json({ postId: Number(id), myRating: null, ...(await ratingSummary(id)) });
}
