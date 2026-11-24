import { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, ...(err.details ?? {}) },
    });
  }

  if (err instanceof MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: {
        message: tooLarge
          ? `File is too large. Maximum size is ${Math.round(env.uploadMaxBytes / 1024 / 1024)} MB.`
          : err.message,
        code: err.code,
      },
    });
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    return res
      .status(409)
      .json({ error: { message: 'User already exists!', code: 'ER_DUP_ENTRY' } });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: {
        message:
          'This post is too large to save. Keep the body under 50,000 characters, and attach ' +
          'images with the cover-image picker instead of pasting them into the editor.',
        code: 'PAYLOAD_TOO_LARGE',
      },
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON body', code: 'INVALID_JSON' } });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      message: env.isProd ? 'Something went wrong' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
