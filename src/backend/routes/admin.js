import express from 'express';
import { auditLog, listUsers, summary, updateUser } from '../controllers/admin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin, requireStaff } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { idParamSchema, listUsersQuerySchema, updateUserSchema } from '../schemas.js';

const router = express.Router();

// Everyone who can reach the admin area needs the summary tiles.
router.get('/stats', requireAuth, requireStaff, asyncHandler(summary));

// Moderators can review the approval queue, but only admins may change roles.
router.get(
  '/users',
  requireAuth,
  requireStaff,
  validate({ query: listUsersQuerySchema }),
  asyncHandler(listUsers)
);
router.patch(
  '/users/:id',
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(updateUser)
);

router.get(
  '/audit',
  requireAuth,
  requireAdmin,
  validate({ query: listUsersQuerySchema }),
  asyncHandler(auditLog)
);

export default router;
