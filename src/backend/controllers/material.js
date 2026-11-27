import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { requireFile, sendDownload } from './file.js';

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'moderator');

export async function listMaterials(req, res) {
  const { q, departmentId, materialType, courseCode, page, pageSize } = req.validated.query;

  // FULLTEXT rather than LIKE so course codes and titles are actually searchable.
  // An empty term means "no search", which keeps the query a single string.
  const searchTerm = q ? `${q}*` : '';
  const departmentParam = departmentId ?? null;
  const materialTypeParam = materialType ?? null;
  const courseCodeParam = courseCode ?? null;

  const params = [
    searchTerm,
    searchTerm,
    departmentParam,
    departmentParam,
    materialTypeParam,
    materialTypeParam,
    courseCodeParam,
    courseCodeParam,
  ];

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
       FROM materials m
       LEFT JOIN departments d ON d.id = m.department_id
       JOIN files f ON f.id = m.file_id
       JOIN users u ON u.id = m.uploaded_by
      WHERE m.status = 'published'
        AND (? = '' OR MATCH(m.title, m.description, m.course_code) AGAINST (? IN BOOLEAN MODE))
        AND (? IS NULL OR m.department_id = ?)
        AND (? IS NULL OR m.material_type = ?)
        AND (? IS NULL OR m.course_code = ?)`,
    params
  );
  const items = await query(
    `SELECT
       m.id, m.title, m.description, m.course_code AS courseCode, m.semester,
       m.material_type AS materialType, m.download_count AS downloadCount,
       m.status, m.created_at AS createdAt,
       m.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
       m.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
       f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
       u.username AS uploadedBy
       FROM materials m
       LEFT JOIN departments d ON d.id = m.department_id
       JOIN files f ON f.id = m.file_id
       JOIN users u ON u.id = m.uploaded_by
      WHERE m.status = 'published'
        AND (? = '' OR MATCH(m.title, m.description, m.course_code) AGAINST (? IN BOOLEAN MODE))
        AND (? IS NULL OR m.department_id = ?)
        AND (? IS NULL OR m.material_type = ?)
        AND (? IS NULL OR m.course_code = ?)
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

  const [row] = await query(
    `SELECT
       m.id, m.title, m.description, m.course_code AS courseCode, m.semester,
       m.material_type AS materialType, m.download_count AS downloadCount,
       m.status, m.created_at AS createdAt,
       m.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
       m.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
       f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
       u.username AS uploadedBy
       FROM materials m
       LEFT JOIN departments d ON d.id = m.department_id
       JOIN files f ON f.id = m.file_id
       JOIN users u ON u.id = m.uploaded_by
      WHERE m.id = ?`,
    [result.insertId]
  );
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
