import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { toSqlDate } from '../utils/dates.js';

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'moderator');

export async function listEvents(req, res) {
  const { from, to, kind, page, pageSize } = req.validated.query;

  const staff = isStaff(req.user) ? 1 : 0;
  const fromDate = from ? toSqlDate(from) : null;
  const toDate = to ? toSqlDate(to) : null;
  const kindParam = kind ?? null;

  const params = [staff, fromDate, fromDate, toDate, toDate, kindParam, kindParam];

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
      WHERE (? = 1 OR e.status = 'published')
        AND (? IS NULL OR e.starts_at >= ?)
        AND (? IS NULL OR e.starts_at <= ?)
        AND (? IS NULL OR e.kind = ?)`,
    params
  );
  const items = await query(
    `SELECT
       e.id, e.title, e.description, e.starts_at AS startsAt, e.ends_at AS endsAt,
       e.all_day AS allDay, e.location, e.kind, e.is_featured AS isFeatured,
       e.status, e.created_at AS createdAt,
       e.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
      WHERE (? = 1 OR e.status = 'published')
        AND (? IS NULL OR e.starts_at >= ?)
        AND (? IS NULL OR e.starts_at <= ?)
        AND (? IS NULL OR e.kind = ?)
      ORDER BY e.starts_at ASC, e.id ASC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

/** Next few upcoming entries — powers the countdown tile on the home page. */
export async function upcomingEvents(req, res) {
  const limit = Math.min(Number(req.query.limit) || 4, 20);

  const items = await query(
    `SELECT
       e.id, e.title, e.description, e.starts_at AS startsAt, e.ends_at AS endsAt,
       e.all_day AS allDay, e.location, e.kind, e.is_featured AS isFeatured,
       e.status, e.created_at AS createdAt,
       e.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.status = 'published' AND e.starts_at >= NOW()
      ORDER BY e.starts_at ASC
      LIMIT ?`,
    [limit]
  );

  res.json(items);
}

export async function createEvent(req, res) {
  const body = req.validated.body;

  const result = await query(
    `INSERT INTO events
       (title, description, starts_at, ends_at, all_day, location, department_id, kind, is_featured, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.title,
      body.description || null,
      toSqlDate(body.startsAt),
      toSqlDate(body.endsAt),
      body.allDay ? 1 : 0,
      body.location || null,
      body.departmentId || null,
      body.kind,
      body.isFeatured ? 1 : 0,
      body.status ?? 'published',
      req.user.id,
    ]
  );

  await logAudit(req, {
    action: 'event.create',
    entityType: 'event',
    entityId: result.insertId,
    detail: { title: body.title, startsAt: toSqlDate(body.startsAt) },
  });

  const [event] = await query(
    `SELECT
       e.id, e.title, e.description, e.starts_at AS startsAt, e.ends_at AS endsAt,
       e.all_day AS allDay, e.location, e.kind, e.is_featured AS isFeatured,
       e.status, e.created_at AS createdAt,
       e.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.id = ?`,
    [result.insertId]
  );
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const [existing] = await query('SELECT id FROM events WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Event not found!');

  const map = {
    title: 'title',
    description: 'description',
    allDay: 'all_day',
    location: 'location',
    departmentId: 'department_id',
    kind: 'kind',
    isFeatured: 'is_featured',
    status: 'status',
  };

  const fields = [];
  const params = [];
  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      const boolean = key === 'allDay' || key === 'isFeatured';
      fields.push(`${column} = ?`);
      params.push(boolean ? (body[key] ? 1 : 0) : body[key] ?? null);
    }
  }
  if (body.startsAt !== undefined) {
    fields.push('starts_at = ?');
    params.push(toSqlDate(body.startsAt));
  }
  if (body.endsAt !== undefined) {
    fields.push('ends_at = ?');
    params.push(toSqlDate(body.endsAt));
  }
  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  await logAudit(req, { action: 'event.update', entityType: 'event', entityId: Number(id) });

  const [event] = await query(
    `SELECT
       e.id, e.title, e.description, e.starts_at AS startsAt, e.ends_at AS endsAt,
       e.all_day AS allDay, e.location, e.kind, e.is_featured AS isFeatured,
       e.status, e.created_at AS createdAt,
       e.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.id = ?`,
    [id]
  );
  res.json(event);
}

export async function deleteEvent(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id FROM events WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Event not found!');

  await query("UPDATE events SET status = 'archived' WHERE id = ?", [id]);
  await logAudit(req, { action: 'event.archive', entityType: 'event', entityId: Number(id) });
  res.json({ message: 'Event archived.', id: Number(id) });
}
