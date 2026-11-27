import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { toSqlDate } from '../utils/dates.js';
import { requireFile } from './file.js';

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'moderator');

export async function listNotices(req, res) {
  const { category, includeExpired, page, pageSize } = req.validated.query;
  const staff = isStaff(req.user) ? 1 : 0;
  // Only staff can narrow by an explicit status; everyone else is pinned to
  // published by the first predicate below.
  const statusParam = staff && req.query.status ? req.query.status : null;
  const includeExpiredParam = includeExpired ? 1 : 0;
  const categoryParam = category ?? null;

  const params = [
    staff,
    statusParam,
    statusParam,
    includeExpiredParam,
    staff,
    categoryParam,
    categoryParam,
  ];

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN files f ON f.id = n.attachment_id
      WHERE (? = 1 OR n.status = 'published')
        AND (? IS NULL OR n.status = ?)
        AND (? = 1 OR ? = 1 OR n.expires_at IS NULL OR n.expires_at > NOW())
        AND (? IS NULL OR n.category = ?)`,
    params
  );

  const items = await query(
    `SELECT
       n.id, n.title, n.body, n.category, n.priority, n.is_pinned AS isPinned,
       n.publish_at AS publishAt, n.expires_at AS expiresAt, n.status,
       n.created_at AS createdAt, n.updated_at AS updatedAt,
       u.username AS author, u.role AS authorRole,
       n.attachment_id AS attachmentId,
       f.filename AS attachmentFilename, f.original_name AS attachmentName,
       f.mime_type AS attachmentMime, f.kind AS attachmentKind, f.size_bytes AS attachmentSize
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN files f ON f.id = n.attachment_id
      WHERE (? = 1 OR n.status = 'published')
        AND (? IS NULL OR n.status = ?)
        AND (? = 1 OR ? = 1 OR n.expires_at IS NULL OR n.expires_at > NOW())
        AND (? IS NULL OR n.category = ?)
      ORDER BY n.is_pinned DESC, n.publish_at DESC, n.id DESC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function getNotice(req, res) {
  const { id } = req.validated.params;

  const [notice] = await query(
    `SELECT
       n.id, n.title, n.body, n.category, n.priority, n.is_pinned AS isPinned,
       n.publish_at AS publishAt, n.expires_at AS expiresAt, n.status,
       n.created_at AS createdAt, n.updated_at AS updatedAt,
       u.username AS author, u.role AS authorRole,
       n.attachment_id AS attachmentId,
       f.filename AS attachmentFilename, f.original_name AS attachmentName,
       f.mime_type AS attachmentMime, f.kind AS attachmentKind, f.size_bytes AS attachmentSize
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN files f ON f.id = n.attachment_id
      WHERE n.id = ?`,
    [id]
  );
  if (!notice) throw ApiError.notFound('Notice not found!');

  if (notice.status !== 'published' && !isStaff(req.user)) {
    throw ApiError.notFound('Notice not found!');
  }

  res.json(notice);
}

export async function createNotice(req, res) {
  const body = req.validated.body;

  if (body.attachmentId) await requireFile(body.attachmentId);

  const result = await query(
    `INSERT INTO notices
       (title, body, category, priority, is_pinned, attachment_id, publish_at, expires_at, status, author_id)
     VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?, ?, ?)`,
    [
      body.title,
      body.body,
      body.category,
      body.priority,
      body.isPinned ? 1 : 0,
      body.attachmentId || null,
      toSqlDate(body.publishAt),
      toSqlDate(body.expiresAt),
      body.status ?? 'published',
      req.user.id,
    ]
  );

  await logAudit(req, {
    action: 'notice.create',
    entityType: 'notice',
    entityId: result.insertId,
    detail: { title: body.title, category: body.category },
  });

  const [notice] = await query(
    `SELECT
       n.id, n.title, n.body, n.category, n.priority, n.is_pinned AS isPinned,
       n.publish_at AS publishAt, n.expires_at AS expiresAt, n.status,
       n.created_at AS createdAt, n.updated_at AS updatedAt,
       u.username AS author, u.role AS authorRole,
       n.attachment_id AS attachmentId,
       f.filename AS attachmentFilename, f.original_name AS attachmentName,
       f.mime_type AS attachmentMime, f.kind AS attachmentKind, f.size_bytes AS attachmentSize
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN files f ON f.id = n.attachment_id
      WHERE n.id = ?`,
    [result.insertId]
  );
  res.status(201).json(notice);
}

export async function updateNotice(req, res) {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const [existing] = await query('SELECT id FROM notices WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Notice not found!');

  if (body.attachmentId) await requireFile(body.attachmentId);

  const map = {
    title: 'title',
    body: 'body',
    category: 'category',
    priority: 'priority',
    isPinned: 'is_pinned',
    attachmentId: 'attachment_id',
    status: 'status',
  };

  const fields = [];
  const params = [];

  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(key === 'isPinned' ? (body[key] ? 1 : 0) : body[key] ?? null);
    }
  }
  if (body.publishAt !== undefined) {
    fields.push('publish_at = ?');
    params.push(toSqlDate(body.publishAt));
  }
  if (body.expiresAt !== undefined) {
    fields.push('expires_at = ?');
    params.push(toSqlDate(body.expiresAt));
  }

  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE notices SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  await logAudit(req, { action: 'notice.update', entityType: 'notice', entityId: Number(id) });

  const [notice] = await query(
    `SELECT
       n.id, n.title, n.body, n.category, n.priority, n.is_pinned AS isPinned,
       n.publish_at AS publishAt, n.expires_at AS expiresAt, n.status,
       n.created_at AS createdAt, n.updated_at AS updatedAt,
       u.username AS author, u.role AS authorRole,
       n.attachment_id AS attachmentId,
       f.filename AS attachmentFilename, f.original_name AS attachmentName,
       f.mime_type AS attachmentMime, f.kind AS attachmentKind, f.size_bytes AS attachmentSize
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN files f ON f.id = n.attachment_id
      WHERE n.id = ?`,
    [id]
  );
  res.json(notice);
}

export async function togglePin(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id, is_pinned FROM notices WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Notice not found!');

  const next = existing.is_pinned ? 0 : 1;
  await query('UPDATE notices SET is_pinned = ? WHERE id = ?', [next, id]);
  await logAudit(req, {
    action: next ? 'notice.pin' : 'notice.unpin',
    entityType: 'notice',
    entityId: Number(id),
  });

  res.json({ id: Number(id), isPinned: Boolean(next) });
}

export async function deleteNotice(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id FROM notices WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Notice not found!');

  // Archived rather than deleted so the record survives for audit.
  await query("UPDATE notices SET status = 'archived' WHERE id = ?", [id]);
  await logAudit(req, { action: 'notice.archive', entityType: 'notice', entityId: Number(id) });

  res.json({ message: 'Notice archived.', id: Number(id) });
}
