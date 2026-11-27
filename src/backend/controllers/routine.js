import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/audit.js';
import { toSqlDate } from '../utils/dates.js';
import { requireFile, sendDownload } from './file.js';

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'moderator');

export async function listRoutines(req, res) {
  const { departmentId, semester, examType, page, pageSize } = req.validated.query;

  const staff = isStaff(req.user) ? 1 : 0;
  const departmentParam = departmentId ?? null;
  const semesterParam = semester ?? null;
  const examTypeParam = examType ?? null;

  const params = [
    staff,
    departmentParam,
    departmentParam,
    semesterParam,
    semesterParam,
    examTypeParam,
    examTypeParam,
  ];

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
       FROM exam_routines r
       LEFT JOIN departments d ON d.id = r.department_id
       JOIN files f ON f.id = r.file_id
       JOIN users u ON u.id = r.created_by
      WHERE (? = 1 OR r.status = 'published')
        AND (? IS NULL OR r.department_id = ? OR r.department_id IS NULL)
        AND (? IS NULL OR r.semester = ?)
        AND (? IS NULL OR r.exam_type = ?)`,
    params
  );
  const items = await query(
    `SELECT
       r.id, r.title, r.semester, r.exam_type AS examType,
       r.effective_from AS effectiveFrom, r.notes, r.status, r.created_at AS createdAt,
       r.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
       r.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
       f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
       u.username AS createdBy
       FROM exam_routines r
       LEFT JOIN departments d ON d.id = r.department_id
       JOIN files f ON f.id = r.file_id
       JOIN users u ON u.id = r.created_by
      WHERE (? = 1 OR r.status = 'published')
        AND (? IS NULL OR r.department_id = ? OR r.department_id IS NULL)
        AND (? IS NULL OR r.semester = ?)
        AND (? IS NULL OR r.exam_type = ?)
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  res.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function createRoutine(req, res) {
  const body = req.validated.body;
  await requireFile(body.fileId);

  const result = await query(
    `INSERT INTO exam_routines
       (title, department_id, semester, exam_type, file_id, effective_from, notes, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.title,
      body.departmentId || null,
      body.semester || null,
      body.examType,
      body.fileId,
      toSqlDate(body.effectiveFrom),
      body.notes || null,
      body.status ?? 'published',
      req.user.id,
    ]
  );

  await logAudit(req, {
    action: 'routine.create',
    entityType: 'exam_routine',
    entityId: result.insertId,
    detail: { title: body.title },
  });

  const [routine] = await query(
    `SELECT
       r.id, r.title, r.semester, r.exam_type AS examType,
       r.effective_from AS effectiveFrom, r.notes, r.status, r.created_at AS createdAt,
       r.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
       r.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
       f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
       u.username AS createdBy
       FROM exam_routines r
       LEFT JOIN departments d ON d.id = r.department_id
       JOIN files f ON f.id = r.file_id
       JOIN users u ON u.id = r.created_by
      WHERE r.id = ?`,
    [result.insertId]
  );
  res.status(201).json(routine);
}

export async function updateRoutine(req, res) {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const [existing] = await query('SELECT id FROM exam_routines WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Routine not found!');
  if (body.fileId) await requireFile(body.fileId);

  const map = {
    title: 'title',
    departmentId: 'department_id',
    semester: 'semester',
    examType: 'exam_type',
    fileId: 'file_id',
    notes: 'notes',
    status: 'status',
  };

  const fields = [];
  const params = [];
  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(body[key] ?? null);
    }
  }
  if (body.effectiveFrom !== undefined) {
    fields.push('effective_from = ?');
    params.push(toSqlDate(body.effectiveFrom));
  }
  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE exam_routines SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  await logAudit(req, { action: 'routine.update', entityType: 'exam_routine', entityId: Number(id) });

  const [routine] = await query(
    `SELECT
       r.id, r.title, r.semester, r.exam_type AS examType,
       r.effective_from AS effectiveFrom, r.notes, r.status, r.created_at AS createdAt,
       r.department_id AS departmentId, d.code AS departmentCode, d.name AS departmentName,
       r.file_id AS fileId, f.filename AS fileFilename, f.original_name AS fileName,
       f.mime_type AS fileMime, f.kind AS fileKind, f.size_bytes AS fileSize,
       u.username AS createdBy
       FROM exam_routines r
       LEFT JOIN departments d ON d.id = r.department_id
       JOIN files f ON f.id = r.file_id
       JOIN users u ON u.id = r.created_by
      WHERE r.id = ?`,
    [id]
  );
  res.json(routine);
}

export async function deleteRoutine(req, res) {
  const { id } = req.validated.params;

  const [existing] = await query('SELECT id FROM exam_routines WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw ApiError.notFound('Routine not found!');

  await query("UPDATE exam_routines SET status = 'archived' WHERE id = ?", [id]);
  await logAudit(req, { action: 'routine.archive', entityType: 'exam_routine', entityId: Number(id) });
  res.json({ message: 'Routine archived.', id: Number(id) });
}

export async function downloadRoutine(req, res) {
  const { id } = req.validated.params;

  const [row] = await query(
    `SELECT f.filename, f.original_name FROM exam_routines r
       JOIN files f ON f.id = r.file_id
      WHERE r.id = ? LIMIT 1`,
    [id]
  );
  if (!row) throw ApiError.notFound('Routine not found!');

  await sendDownload(res, { filename: row.filename, original_name: row.original_name });
}
