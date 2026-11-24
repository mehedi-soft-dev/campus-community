import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';
import { MIME_TYPES, uploadDir } from '../middleware/upload.js';

/** Persists an uploaded file and returns its `files` row. */
export async function uploadFile(req, res) {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded. Send it as a multipart field named "file".');
  }

  const meta = MIME_TYPES[req.file.mimetype];

  // Images get the tighter cap; documents were already limited by multer.
  if (meta.kind === 'image' && req.file.size > env.uploadMaxBytes) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(
      413,
      `File is too large. Maximum image size is ${Math.round(env.uploadMaxBytes / 1024 / 1024)} MB.`,
      'LIMIT_FILE_SIZE'
    );
  }

  const result = await query(
    `INSERT INTO files (filename, original_name, mime_type, size_bytes, kind, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, meta.kind, req.user.id]
  );

  res.status(201).json({
    id: result.insertId,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    kind: meta.kind,
    url: `/uploads/${req.file.filename}`,
  });
}

/** Loads a file row, or throws 400 — used to validate `fileId` references. */
export async function requireFile(fileId) {
  const [file] = await query('SELECT * FROM files WHERE id = ? LIMIT 1', [fileId]);
  if (!file) throw ApiError.badRequest('That file does not exist.', 'UNKNOWN_FILE');
  return file;
}

/**
 * Any stored file, as an attachment.
 *
 * /uploads/<name> serves the same bytes inline, which is what "View" uses; this
 * forces Content-Disposition: attachment so "Download" actually saves the file
 * instead of re-opening it in a tab.
 */
export async function downloadFile(req, res) {
  const file = await requireFile(req.validated.params.id);
  sendDownload(res, file);
}

/** Streams a stored file as a download and counts it. */
export async function sendDownload(res, file, { count = false, table, id } = {}) {
  const absolute = path.join(uploadDir, file.filename);

  if (count && table && id) {
    await query(`UPDATE ${table} SET download_count = download_count + 1 WHERE id = ?`, [id]);
  }

  res.download(absolute, file.original_name, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: { message: 'File is missing from storage.', code: 'FILE_MISSING' } });
    }
  });
}
