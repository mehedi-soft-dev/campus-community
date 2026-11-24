import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { isOwnerOrStaff } from '../middleware/authorize.js';

async function requireVisiblePost(postId) {
  const [post] = await query("SELECT id, status FROM posts WHERE id = ? LIMIT 1", [postId]);
  if (!post || post.status !== 'published') throw ApiError.notFound('Post not found!');
  return post;
}

export async function listComments(req, res) {
  const { id } = req.validated.params;
  const { sort } = req.validated.query;
  const viewerId = req.user?.id ?? 0;

  await requireVisiblePost(id);

  const rows = (
    await query(
      `SELECT c.id, c.parent_id AS parentId, c.body, c.created_at AS createdAt,
              c.status, c.user_id AS userId,
              u.username, u.img AS userImg, u.role AS authorRole,
              COALESCE(SUM(cv.value), 0) AS score,
              (SELECT value FROM comment_votes WHERE comment_id = c.id AND user_id = ?) AS myVote
         FROM comments c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN comment_votes cv ON cv.comment_id = c.id
        WHERE c.post_id = ? AND c.status = 'visible'
        GROUP BY c.id`,
      [viewerId, id]
    )
  ).map((row) => ({
    // SUM returns DECIMAL, which mysql2 hands back as a string.
    ...row,
    score: Number(row.score ?? 0),
    myVote: row.myVote === null || row.myVote === undefined ? null : Number(row.myVote),
  }));

  // One level of replies: parents keep their own order, replies sit under them.
  const byId = new Map(rows.map((row) => [row.id, { ...row, replies: [] }]));
  const roots = [];

  for (const row of byId.values()) {
    if (row.parentId && byId.has(row.parentId)) byId.get(row.parentId).replies.push(row);
    else roots.push(row);
  }

  const compare = (a, b) =>
    sort === 'top' ? b.score - a.score || +new Date(a.createdAt) - +new Date(b.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt);

  roots.sort(compare);
  for (const root of roots) root.replies.sort(compare);

  res.json({ items: roots, total: rows.length });
}

export async function addComment(req, res) {
  const { id } = req.validated.params;
  const { body } = req.validated.body;
  let { parentId } = req.validated.body;

  await requireVisiblePost(id);

  if (parentId) {
    const [parent] = await query(
      'SELECT id, post_id, parent_id FROM comments WHERE id = ? LIMIT 1',
      [parentId]
    );
    if (!parent || parent.post_id !== Number(id)) {
      throw ApiError.badRequest('That comment does not belong to this post.', 'BAD_PARENT');
    }
    // Enforce a single level: replying to a reply attaches to the root.
    if (parent.parent_id) {
      parentId = parent.parent_id;
    }
  }

  const result = await query(
    'INSERT INTO comments (post_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)',
    [id, req.user.id, parentId || null, body]
  );

  const [comment] = await query(
    `SELECT c.id, c.parent_id AS parentId, c.body, c.created_at AS createdAt,
            c.user_id AS userId, u.username, u.img AS userImg, u.role AS authorRole,
            0 AS score, NULL AS myVote
       FROM comments c JOIN users u ON u.id = c.user_id
      WHERE c.id = ?`,
    [result.insertId]
  );

  res.status(201).json({ ...comment, replies: [] });
}

export async function updateComment(req, res) {
  const { id } = req.validated.params;
  const { body } = req.validated.body;

  const [comment] = await query(
    'SELECT id, user_id, status FROM comments WHERE id = ? LIMIT 1',
    [id]
  );
  if (!comment || comment.status === 'removed') throw ApiError.notFound('Comment not found!');

  // The author may fix their own wording; staff may edit anything as a
  // moderation action. Nobody else can touch it.
  const isAuthor = comment.user_id === req.user.id;
  if (!isOwnerOrStaff(req.user, comment.user_id)) {
    throw ApiError.forbidden('You can edit only your own comment.');
  }

  await query('UPDATE comments SET body = ? WHERE id = ?', [body, id]);

  if (!isAuthor) {
    await logAudit(req, {
      action: 'comment.edit',
      entityType: 'comment',
      entityId: Number(id),
      detail: { byStaff: true },
    });
  }

  res.json({ id: Number(id), body });
}

export async function deleteComment(req, res) {
  const { id } = req.validated.params;

  const [comment] = await query(
    'SELECT id, user_id, status FROM comments WHERE id = ? LIMIT 1',
    [id]
  );
  if (!comment || comment.status === 'removed') throw ApiError.notFound('Comment not found!');

  if (!isOwnerOrStaff(req.user, comment.user_id)) {
    throw ApiError.forbidden('You can delete only your own comment.');
  }

  await query("UPDATE comments SET status = 'removed' WHERE id = ?", [id]);
  await logAudit(req, {
    action: 'comment.remove',
    entityType: 'comment',
    entityId: Number(id),
    detail: { byStaff: comment.user_id !== req.user.id },
  });

  res.json({ message: 'Comment removed.', id: Number(id) });
}

export async function voteComment(req, res) {
  const { id } = req.validated.params;
  const { value } = req.validated.body;

  const [comment] = await query('SELECT id, user_id FROM comments WHERE id = ? LIMIT 1', [id]);
  if (!comment) throw ApiError.notFound('Comment not found!');
  if (comment.user_id === req.user.id) {
    throw new ApiError(403, 'You cannot vote on your own comment.', 'SELF_VOTE');
  }

  if (value === 0) {
    await query('DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?', [id, req.user.id]);
  } else {
    await query(
      `INSERT INTO comment_votes (comment_id, user_id, value) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [id, req.user.id, value]
    );
  }

  const [score] = await query(
    'SELECT COALESCE(SUM(value), 0) AS score FROM comment_votes WHERE comment_id = ?',
    [id]
  );

  res.json({ id: Number(id), myVote: value === 0 ? null : value, score: Number(score.score) });
}
