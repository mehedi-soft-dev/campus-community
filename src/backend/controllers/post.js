import sanitizeHtml from 'sanitize-html';
import crypto from 'node:crypto';
import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { isOwnerOrStaff } from '../middleware/authorize.js';

// Post bodies are rich text from react-quill and are rendered with
// dangerouslySetInnerHTML, so they must be sanitized on write as well as on render.
const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4',
    'blockquote', 'ul', 'ol', 'li', 'a', 'code', 'pre',
  ],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

const cleanHtml = (html) => sanitizeHtml(html, sanitizeOptions);

// mysql2 returns DECIMAL (AVG) and some SUM aggregates as strings. Normalise at
// the API boundary so clients can treat these as numbers.
const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

const normalizePost = (row) => ({
  ...row,
  ratingAvg: toNumber(row.ratingAvg),
  ratingCount: Number(row.ratingCount ?? 0),
  positiveRatio: toNumber(row.positiveRatio),
  commentCount: Number(row.commentCount ?? 0),
  views: Number(row.views ?? 0),
});

// Weight of the prior in the "top rated" score. Higher = a post needs more
// ratings before it can outrank well-rated ones. See the ORDER BY below.
const RATING_CONFIDENCE = 5;

export async function getPosts(req, res) {
  const { category, sort, q, author, page, pageSize } = req.validated.query;
  const viewerId = req.user?.id ?? 0;

  const categoryParam = category ?? null;
  const authorParam = author ?? null;
  // Match the body as well as the title: a phrase that only appears in the
  // article text should still be findable. Neither column is indexed for
  // this, which is fine at a varsity's scale — a FULLTEXT index (as materials
  // already has) is the next step if the archive grows.
  const qPattern = q ? `%${q}%` : null;

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
       FROM posts p
       JOIN users u ON u.id = p.uid
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS rating_count, AVG(value) AS rating_avg,
                SUM(value >= 4) / NULLIF(COUNT(*), 0) AS positive_ratio
           FROM post_ratings GROUP BY post_id
       ) r ON r.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count
           FROM comments WHERE status = 'visible' GROUP BY post_id
       ) cm ON cm.post_id = p.id
      WHERE p.status = 'published'
        AND (? IS NULL OR c.code = ?)
        AND (? IS NULL OR u.username = ?)
        AND (? IS NULL OR p.title LIKE ? OR p.\`desc\` LIKE ?)`,
    [
      categoryParam,
      categoryParam,
      authorParam,
      authorParam,
      qPattern,
      qPattern,
      qPattern,
    ]
  );

  // Bayesian ranking: a single 5-star vote must not beat twenty 4.8s.
  let prior = 0;
  if (sort === 'top') {
    const [{ globalAvg }] = await query('SELECT AVG(value) AS globalAvg FROM post_ratings');
    prior = Number(globalAvg ?? 0);
  }

  const offset = (page - 1) * pageSize;

  const items = await query(
    `SELECT
       p.id, p.title, p.\`desc\`, p.img, p.date, p.updated_at AS updatedAt,
       p.uid, p.status, p.views, p.category_id AS categoryId,
       c.code AS categoryCode, c.name AS categoryName, c.accent_hue AS categoryHue,
       c.banner_img AS categoryBanner,
       u.username, u.img AS userImg, u.role AS authorRole,
       COALESCE(r.rating_count, 0) AS ratingCount,
       r.rating_avg AS ratingAvg,
       r.positive_ratio AS positiveRatio,
       COALESCE(cm.comment_count, 0) AS commentCount,
       (SELECT value FROM post_ratings WHERE post_id = p.id AND user_id = ?) AS myRating
       FROM posts p
       JOIN users u ON u.id = p.uid
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS rating_count, AVG(value) AS rating_avg,
                SUM(value >= 4) / NULLIF(COUNT(*), 0) AS positive_ratio
           FROM post_ratings GROUP BY post_id
       ) r ON r.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count
           FROM comments WHERE status = 'visible' GROUP BY post_id
       ) cm ON cm.post_id = p.id
      WHERE p.status = 'published'
        AND (? IS NULL OR c.code = ?)
        AND (? IS NULL OR u.username = ?)
        AND (? IS NULL OR p.title LIKE ? OR p.\`desc\` LIKE ?)
      ORDER BY
        CASE WHEN ? = 'top' THEN
          CASE
            WHEN COALESCE(r.rating_count, 0) = 0 THEN 0
            ELSE (r.rating_count / (r.rating_count + ?)) * r.rating_avg
               + (? / (r.rating_count + ?)) * ?
          END
        END DESC,
        CASE WHEN ? = 'top' THEN COALESCE(r.rating_count, 0) END DESC,
        p.date DESC,
        p.id DESC
      LIMIT ? OFFSET ?`,
    [
      viewerId,
      categoryParam,
      categoryParam,
      authorParam,
      authorParam,
      qPattern,
      qPattern,
      qPattern,
      sort,
      RATING_CONFIDENCE,
      RATING_CONFIDENCE,
      RATING_CONFIDENCE,
      prior,
      sort,
      pageSize,
      offset,
    ]
  );

  res.json({
    items: items.map(normalizePost),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

// A refresh, a back-navigation, a crawler or a double-invoked mount effect must
// not each add a view, so a visitor counts once per post per window. Six hours
// means "I read this earlier today" does not count again, while coming back
// tomorrow legitimately does.
const VIEW_WINDOW_MS = 6 * 60 * 60 * 1000;

const visitorKey = (req) =>
  crypto
    .createHash('sha256')
    .update(`${req.ip ?? 'unknown'}|${req.headers['user-agent'] ?? ''}`)
    .digest('hex');

/** Records the visit, and bumps posts.views only the first time in the window. */
async function countView(postId, req) {
  const key = visitorKey(req);

  const [seen] = await query(
    'SELECT last_viewed_at AS lastViewedAt FROM post_views WHERE post_id = ? AND visitor_key = ?',
    [postId, key]
  );

  const alreadyCounted =
    Boolean(seen) && Date.now() - new Date(seen.lastViewedAt).getTime() < VIEW_WINDOW_MS;

  await query(
    `INSERT INTO post_views (post_id, visitor_key) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE last_viewed_at = NOW()`,
    [postId, key]
  );

  if (alreadyCounted) return false;

  await query('UPDATE posts SET views = views + 1 WHERE id = ?', [postId]);
  return true;
}

export async function getPost(req, res) {
  const { id } = req.validated.params;
  const viewerId = req.user?.id ?? 0;

  const [post] = await query(
    `SELECT
       p.id, p.title, p.\`desc\`, p.img, p.date, p.updated_at AS updatedAt,
       p.uid, p.status, p.views, p.category_id AS categoryId,
       c.code AS categoryCode, c.name AS categoryName, c.accent_hue AS categoryHue,
       c.banner_img AS categoryBanner,
       u.username, u.img AS userImg, u.role AS authorRole,
       COALESCE(r.rating_count, 0) AS ratingCount,
       r.rating_avg AS ratingAvg,
       r.positive_ratio AS positiveRatio,
       COALESCE(cm.comment_count, 0) AS commentCount,
       (SELECT value FROM post_ratings WHERE post_id = p.id AND user_id = ?) AS myRating
       FROM posts p
       JOIN users u ON u.id = p.uid
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS rating_count, AVG(value) AS rating_avg,
                SUM(value >= 4) / NULLIF(COUNT(*), 0) AS positive_ratio
           FROM post_ratings GROUP BY post_id
       ) r ON r.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count
           FROM comments WHERE status = 'visible' GROUP BY post_id
       ) cm ON cm.post_id = p.id
      WHERE p.id = ?`,
    [viewerId, id]
  );
  if (!post) throw ApiError.notFound('Post not found!');

  // Removed posts stay in the database for audit, but are gone for everyone
  // except their owner and staff.
  if (post.status !== 'published' && !isOwnerOrStaff(req.user, post.uid)) {
    throw ApiError.notFound('Post not found!');
  }

  // Reading your own post is not a view of it.
  if (post.status === 'published' && post.uid !== req.user?.id) {
    const counted = await countView(id, req);
    // Only report back a number we actually incremented, so the figure on the
    // page matches the figure in the database.
    if (counted) post.views += 1;
  }

  res.json(normalizePost(post));
}

export async function addPost(req, res) {
  const { title, desc, categoryId, img } = req.validated.body;

  const [category] = await query('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
  if (!category) throw ApiError.badRequest('That category does not exist.', 'UNKNOWN_CATEGORY');

  const result = await query(
    `INSERT INTO posts (title, \`desc\`, img, category_id, status, uid)
     VALUES (?, ?, ?, ?, 'published', ?)`,
    [title, cleanHtml(desc), img || null, categoryId, req.user.id]
  );

  const [post] = await query(
    `SELECT
       p.id, p.title, p.\`desc\`, p.img, p.date, p.updated_at AS updatedAt,
       p.uid, p.status, p.views, p.category_id AS categoryId,
       c.code AS categoryCode, c.name AS categoryName, c.accent_hue AS categoryHue,
       c.banner_img AS categoryBanner,
       u.username, u.img AS userImg, u.role AS authorRole,
       COALESCE(r.rating_count, 0) AS ratingCount,
       r.rating_avg AS ratingAvg,
       r.positive_ratio AS positiveRatio,
       COALESCE(cm.comment_count, 0) AS commentCount,
       (SELECT value FROM post_ratings WHERE post_id = p.id AND user_id = ?) AS myRating
       FROM posts p
       JOIN users u ON u.id = p.uid
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS rating_count, AVG(value) AS rating_avg,
                SUM(value >= 4) / NULLIF(COUNT(*), 0) AS positive_ratio
           FROM post_ratings GROUP BY post_id
       ) r ON r.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count
           FROM comments WHERE status = 'visible' GROUP BY post_id
       ) cm ON cm.post_id = p.id
      WHERE p.id = ?`,
    [req.user.id, result.insertId]
  );
  res.status(201).json(normalizePost(post));
}

export async function updatePost(req, res) {
  const { id } = req.validated.params;
  const { title, desc, categoryId, img } = req.validated.body;

  const [post] = await query('SELECT uid FROM posts WHERE id = ? LIMIT 1', [id]);
  if (!post) throw ApiError.notFound('Post not found!');
  if (!isOwnerOrStaff(req.user, post.uid)) {
    throw ApiError.forbidden('You can update only your own post!');
  }

  await query(
    'UPDATE posts SET title = ?, `desc` = ?, img = ?, category_id = ? WHERE id = ?',
    [title, cleanHtml(desc), img || null, categoryId, id]
  );

  const [updated] = await query(
    `SELECT
       p.id, p.title, p.\`desc\`, p.img, p.date, p.updated_at AS updatedAt,
       p.uid, p.status, p.views, p.category_id AS categoryId,
       c.code AS categoryCode, c.name AS categoryName, c.accent_hue AS categoryHue,
       c.banner_img AS categoryBanner,
       u.username, u.img AS userImg, u.role AS authorRole,
       COALESCE(r.rating_count, 0) AS ratingCount,
       r.rating_avg AS ratingAvg,
       r.positive_ratio AS positiveRatio,
       COALESCE(cm.comment_count, 0) AS commentCount,
       (SELECT value FROM post_ratings WHERE post_id = p.id AND user_id = ?) AS myRating
       FROM posts p
       JOIN users u ON u.id = p.uid
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS rating_count, AVG(value) AS rating_avg,
                SUM(value >= 4) / NULLIF(COUNT(*), 0) AS positive_ratio
           FROM post_ratings GROUP BY post_id
       ) r ON r.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comment_count
           FROM comments WHERE status = 'visible' GROUP BY post_id
       ) cm ON cm.post_id = p.id
      WHERE p.id = ?`,
    [req.user.id, id]
  );
  res.json(normalizePost(updated));
}

export async function deletePost(req, res) {
  const { id } = req.validated.params;

  const [post] = await query('SELECT uid FROM posts WHERE id = ? LIMIT 1', [id]);
  if (!post) throw ApiError.notFound('Post not found!');
  if (!isOwnerOrStaff(req.user, post.uid)) {
    throw ApiError.forbidden('You can delete only your own post!');
  }

  // Soft delete keeps ratings, comments and reports coherent for moderation.
  await query("UPDATE posts SET status = 'removed' WHERE id = ?", [id]);
  res.json({ message: 'Post has been deleted!', id });
}
