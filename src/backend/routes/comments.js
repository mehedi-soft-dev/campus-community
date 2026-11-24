import express from 'express';
import { deleteComment, updateComment, voteComment } from '../controllers/comment.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireActive } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { idParamSchema, updateCommentSchema, voteSchema } from '../schemas.js';

const router = express.Router();

router.put(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: updateCommentSchema }),
  asyncHandler(updateComment)
);
router.delete(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema }),
  asyncHandler(deleteComment)
);
router.put(
  '/:id/vote',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema, body: voteSchema }),
  asyncHandler(voteComment)
);

export default router;
