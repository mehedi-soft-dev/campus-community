import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';

export async function listUsers(req, res) {
  const { status, role, q, page, pageSize } = req.validated.query;

  const where = ['1 = 1'];
  const params = [];

  if (status) {
    where.push('u.status = ?');
    params.push(status);
  }
  if (role) {
    where.push('u.role = ?');
    params.push(role);
  }
  if (q) {
    where.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = (page - 1) * pageSize;

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM users u ${whereSql}`,
    params
  );

  const items = await query(
    `SELECT u.id, u.username, u.email, u.role, u.status, u.full_name AS fullName,
            u.batch, u.department_id AS departmentId, d.name AS departmentName,
            u.img
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       ${whereSql}
      ORDER BY (u.status = 'pending') DESC, u.id DESC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function updateUser(req, res) {
  const { id } = req.validated.params;
  const { status, role } = req.validated.body;

  const [target] = await query('SELECT id, role, status FROM users WHERE id = ? LIMIT 1', [id]);
  if (!target) throw ApiError.notFound('User not found!');

  // Self-lockout guard: an admin must not be able to suspend or demote
  // themselves, or the last admin can strand the whole site.
  if (target.id === req.user.id) {
    if (status && status !== target.status) {
      throw new ApiError(400, 'You cannot change your own account status.', 'SELF_STATUS_CHANGE');
    }
    if (role && role !== target.role) {
      throw new ApiError(400, 'You cannot change your own role.', 'SELF_ROLE_CHANGE');
    }
  }

  const fields = [];
  const params = [];
  if (status !== undefined) {
    fields.push('status = ?');
    params.push(status);
  }
  if (role !== undefined) {
    fields.push('role = ?');
    params.push(role);
  }
  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);

  await logAudit(req, {
    action: status ? `user.${status}` : 'user.role',
    entityType: 'user',
    entityId: Number(id),
    detail: { status, role, username: target.id },
  });

  const [updated] = await query(
    `SELECT u.id, u.username, u.email, u.role, u.status, u.full_name AS fullName,
            u.batch, u.department_id AS departmentId, d.name AS departmentName
       FROM users u LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = ?`,
    [id]
  );

  res.json(updated);
}

export async function summary(req, res) {
  // query() already returns rows, so take the first row — destructuring twice
  // would try to iterate a row object.
  const [users] = await query(
    `SELECT COUNT(*) AS total,
            SUM(status = 'pending')   AS pending,
            SUM(status = 'active')    AS active,
            SUM(status = 'suspended') AS suspended,
            SUM(role = 'moderator')   AS moderators,
            SUM(role = 'admin')       AS admins
       FROM users`
  );
  const [posts] = await query("SELECT COUNT(*) AS total FROM posts WHERE status = 'published'");
  const [notices] = await query("SELECT COUNT(*) AS total FROM notices WHERE status = 'published'");
  const [events] = await query("SELECT COUNT(*) AS total FROM events WHERE status = 'published'");
  const [materials] = await query("SELECT COUNT(*) AS total FROM materials WHERE status = 'published'");
  const [ratings] = await query('SELECT COUNT(*) AS total FROM post_ratings');
  const [comments] = await query("SELECT COUNT(*) AS total FROM comments WHERE status = 'visible'");

  res.json({
    users: {
      total: Number(users.total ?? 0),
      pending: Number(users.pending ?? 0),
      active: Number(users.active ?? 0),
      suspended: Number(users.suspended ?? 0),
      moderators: Number(users.moderators ?? 0),
      admins: Number(users.admins ?? 0),
    },
    posts: Number(posts.total ?? 0),
    notices: Number(notices.total ?? 0),
    events: Number(events.total ?? 0),
    materials: Number(materials.total ?? 0),
    ratings: Number(ratings.total ?? 0),
    comments: Number(comments.total ?? 0),
  });
}

export async function auditLog(req, res) {
  const { page, pageSize } = req.validated.query;

  const [{ total }] = await query('SELECT COUNT(*) AS total FROM audit_log');
  const items = await query(
    `SELECT a.id, a.action, a.entity_type AS entityType, a.entity_id AS entityId,
            a.detail, a.ip, a.created_at AS createdAt, u.username AS actor
       FROM audit_log a
       LEFT JOIN users u ON u.id = a.actor_id
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?`,
    [pageSize, (page - 1) * pageSize]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}
