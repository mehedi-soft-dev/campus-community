import express from 'express';
import {
  createRoutine,
  deleteRoutine,
  downloadRoutine,
  listRoutines,
  updateRoutine,
} from '../controllers/routine.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireStaff } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createRoutineSchema,
  idParamSchema,
  listRoutinesQuerySchema,
  updateRoutineSchema,
} from '../schemas.js';

const router = express.Router();

router.get('/', optionalAuth, validate({ query: listRoutinesQuerySchema }), asyncHandler(listRoutines));
router.get('/:id/download', validate({ params: idParamSchema }), asyncHandler(downloadRoutine));

router.post(
  '/',
  requireAuth,
  requireStaff,
  validate({ body: createRoutineSchema }),
  asyncHandler(createRoutine)
);
router.put(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema, body: updateRoutineSchema }),
  asyncHandler(updateRoutine)
);
router.delete(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema }),
  asyncHandler(deleteRoutine)
);

export default router;
