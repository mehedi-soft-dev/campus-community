import express from 'express';
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from '../controllers/department.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createDepartmentSchema, idParamSchema, updateDepartmentSchema } from '../schemas.js';

const router = express.Router();

router.get('/', asyncHandler(listDepartments));

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate({ body: createDepartmentSchema }),
  asyncHandler(createDepartment)
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  asyncHandler(updateDepartment)
);
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema }),
  asyncHandler(deleteDepartment)
);

export default router;
