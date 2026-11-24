import express from 'express';
import {
  createNotice,
  deleteNotice,
  getNotice,
  listNotices,
  togglePin,
  updateNotice,
} from '../controllers/notice.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireStaff } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createNoticeSchema,
  idParamSchema,
  listNoticesQuerySchema,
  updateNoticeSchema,
} from '../schemas.js';

const router = express.Router();

router.get('/', optionalAuth, validate({ query: listNoticesQuerySchema }), asyncHandler(listNotices));
router.get('/:id', optionalAuth, validate({ params: idParamSchema }), asyncHandler(getNotice));

router.post(
  '/',
  requireAuth,
  requireStaff,
  validate({ body: createNoticeSchema }),
  asyncHandler(createNotice)
);
router.put(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema, body: updateNoticeSchema }),
  asyncHandler(updateNotice)
);
router.patch(
  '/:id/pin',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema }),
  asyncHandler(togglePin)
);
router.delete(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema }),
  asyncHandler(deleteNotice)
);

export default router;
