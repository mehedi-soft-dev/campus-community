import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';

export async function listDepartments(req, res) {
  const rows = await query(
    `SELECT d.id, d.code, d.name, d.faculty, d.sort_order AS sortOrder, d.is_active AS isActive
       FROM departments d
      ORDER BY d.sort_order ASC, d.name ASC`
  );
  res.json(rows);
}

export async function createDepartment(req, res) {
  const { code, name, faculty, sortOrder, isActive } = req.validated.body;

  const clash = await query('SELECT id FROM departments WHERE code = ? LIMIT 1', [code]);
  if (clash.length) throw ApiError.conflict(`Department ${code} already exists.`);

  const result = await query(
    'INSERT INTO departments (code, name, faculty, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
    [code, name, faculty || null, sortOrder, isActive ? 1 : 0]
  );

  await logAudit(req, {
    action: 'department.create',
    entityType: 'department',
    entityId: result.insertId,
    detail: { code, name },
  });

  const [row] = await query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
  res.status(201).json(row);
}

export async function updateDepartment(req, res) {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const [existing] = await query('SELECT id FROM departments WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Department not found!');

  const map = { name: 'name', faculty: 'faculty', sortOrder: 'sort_order', isActive: 'is_active' };
  const fields = [];
  const params = [];

  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(key === 'isActive' ? (body[key] ? 1 : 0) : body[key] ?? null);
    }
  }

  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  await logAudit(req, { action: 'department.update', entityType: 'department', entityId: Number(id), detail: body });

  const [row] = await query('SELECT * FROM departments WHERE id = ?', [id]);
  res.json(row);
}

export async function deleteDepartment(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id FROM departments WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Department not found!');

  const [{ total }] = await query('SELECT COUNT(*) AS total FROM users WHERE department_id = ?', [id]);
  if (total > 0) {
    throw new ApiError(
      409,
      `${total} account(s) still use that department. Reassign them first.`,
      'DEPARTMENT_IN_USE'
    );
  }

  await query('DELETE FROM departments WHERE id = ?', [id]);
  await logAudit(req, { action: 'department.delete', entityType: 'department', entityId: Number(id) });
  res.json({ message: 'Department deleted.', id });
}
