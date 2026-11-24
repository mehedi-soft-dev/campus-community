import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../uploads'
);

fs.mkdirSync(uploadDir, { recursive: true });

/**
 * Extension is derived from the verified MIME type, never from the
 * client-supplied filename, so an upload cannot land on disk with an
 * executable extension. `kind` decides which size cap applies.
 */
export const MIME_TYPES = {
  'image/jpeg': { ext: '.jpg', kind: 'image' },
  'image/png': { ext: '.png', kind: 'image' },
  'image/webp': { ext: '.webp', kind: 'image' },
  'image/gif': { ext: '.gif', kind: 'image' },
  'image/avif': { ext: '.avif', kind: 'image' },

  'application/pdf': { ext: '.pdf', kind: 'document' },
  'application/msword': { ext: '.doc', kind: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: '.docx',
    kind: 'document',
  },
  'application/vnd.ms-powerpoint': { ext: '.ppt', kind: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: '.pptx',
    kind: 'document',
  },
  'application/vnd.ms-excel': { ext: '.xls', kind: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    ext: '.xlsx',
    kind: 'document',
  },
  'application/zip': { ext: '.zip', kind: 'document' },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const base =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .slice(0, 40) || 'file';
    const unique = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}-${unique}-${base}${MIME_TYPES[file.mimetype].ext}`);
  },
});

export const upload = multer({
  storage,
  // Documents are legitimately larger than cover images; images are capped
  // separately in the controller so each kind gets the right limit.
  limits: { fileSize: Math.max(env.uploadMaxBytes, env.documentMaxBytes), files: 1 },
  fileFilter: (req, file, cb) => {
    if (!MIME_TYPES[file.mimetype]) {
      return cb(
        ApiError.badRequest(
          `Unsupported file type "${file.mimetype}". Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP and images.`,
          'UNSUPPORTED_FILE_TYPE'
        )
      );
    }
    return cb(null, true);
  },
});
