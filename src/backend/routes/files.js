import express from 'express';
import { downloadFile } from '../controllers/file.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { idParamSchema } from '../schemas.js';

const router = express.Router();

// Public, because the identical bytes are already served inline from /uploads —
// this route only changes the Content-Disposition to "attachment".
router.get(
  '/:id/download',
  validate({ params: idParamSchema }),
  asyncHandler(downloadFile)
);

export default router;
