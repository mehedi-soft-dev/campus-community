import express from 'express';
import {
  createMaterial,
  deleteMaterial,
  downloadMaterial,
  listMaterials,
} from '../controllers/material.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireActive } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createMaterialSchema, idParamSchema, listMaterialsQuerySchema } from '../schemas.js';

const router = express.Router();

router.get('/', validate({ query: listMaterialsQuerySchema }), asyncHandler(listMaterials));
router.get('/:id/download', validate({ params: idParamSchema }), asyncHandler(downloadMaterial));

// Community-contributed: any approved member may upload, unlike notices.
router.post(
  '/',
  requireAuth,
  requireActive,
  validate({ body: createMaterialSchema }),
  asyncHandler(createMaterial)
);
router.delete(
  '/:id',
  requireAuth,
  requireActive,
  validate({ params: idParamSchema }),
  asyncHandler(deleteMaterial)
);

export default router;
