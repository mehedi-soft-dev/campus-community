import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { requireFile, sendDownload } from './file.js';

const MATERIAL_FIELDS = `
  m.id, m.title, m.description, m.course_code AS courseCode, m.semester,
  m.material_type AS materialType, m.download_count AS downloadCount,
  m.status, m.created_at AS createdAt,
  m.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
  m.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
  f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
  u.username AS uploadedBy
`;

const MATERIAL_JOINS = `
  FROM materials m
  LEFT JOIN departments d ON d.id = m.department_id
  JOIN files f ON f.id = m.file_id
  JOIN users u ON u.id = m.uploaded_by
`;

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'moderator');

export async function listMaterials(req, res) {
  const { q, departmentId, materialType, courseCode, page, pageSize } = req.validated.query;

  const where = ["m.status = 'published'"];
  const params = [];

  if (q) {
    // FULLTEXT rather than LIKE so course codes and titles are actually searchable.
    where.push('MATCH(m.title, m.description, m.course_code) AGAINST (? IN BOOLEAN MODE)');
    params.push(`${q}*`);
  }
  if (departmentId) {
    where.push('m.department_id = ?');
    params.push(departmentId);
  }
  if (materialType) {
    where.push('m.material_type = ?');
    params.push(materialType);
  }
  if (courseCode) {
    where.push('m.course_code = ?');
    params.push(courseCode);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [{ total }] = await query(`SELECT COUNT(*) AS total ${MATERIAL_JOINS} ${whereSql}`, params);
  const items = await query(
    `SELECT ${MATERIAL_FIELDS} ${MATERIAL_JOINS} ${whereSql}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function createMaterial(req, res) {
  const body = req.validated.body;
  await requireFile(body.fileId);

  const result = await query(
    `INSERT INTO materials
       (title, description, course_code, department_id, semester, material_type, file_id, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.title,
      body.description || null,
      body.courseCode || null,
      body.departmentId || null,
      body.semester || null,
      body.materialType,
      body.fileId,
      req.user.id,
    ]
  );

  await logAudit(req, {
    action: 'material.create',
    entityType: 'material',
    entityId: result.insertId,
    detail: { title: body.title },
  });

  const [row] = await query(`SELECT ${MATERIAL_FIELDS} ${MATERIAL_JOINS} WHERE m.id = ?`, [
    result.insertId,
  ]);
  res.status(201).json(row);
}

export async function deleteMaterial(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id, uploaded_by FROM materials WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Material not found!');

  if (existing.uploaded_by !== req.user.id && !isStaff(req.user)) {
    throw ApiError.forbidden('You can remove only your own uploads.');
  }

  await query("UPDATE materials SET status = 'removed' WHERE id = ?", [id]);
  await logAudit(req, {
    action: 'material.remove',
    entityType: 'material',
    entityId: Number(id),
    detail: { byStaff: existing.uploaded_by !== req.user.id },
  });

  res.json({ message: 'Material removed.', id: Number(id) });
}

export async function downloadMaterial(req, res) {
  const { id } = req.validated.params;

  const [row] = await query(
    `SELECT m.id, f.filename, f.original_name FROM materials m
       JOIN files f ON f.id = m.file_id
      WHERE m.id = ? AND m.status = 'published' LIMIT 1`,
    [id]
  );
  if (!row) throw ApiError.notFound('Material not found!');

  await sendDownload(res, { filename: row.filename, original_name: row.original_name }, {
    count: true,
    table: 'materials',
    id: row.id,
  });
}
