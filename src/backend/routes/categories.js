import express from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '../controllers/category.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createCategorySchema, idParamSchema, updateCategorySchema, codeParamSchema } from '../schemas.js';

const router = express.Router();

router.get('/', optionalAuth, asyncHandler(listCategories));
router.get(
  '/:codeOrSlug',
  validate({ params: codeParamSchema }),
  asyncHandler(getCategory)
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate({ body: createCategorySchema }),
  asyncHandler(createCategory)
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(updateCategory)
);
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema }),
  asyncHandler(deleteCategory)
);

export default router;
