import express from 'express';
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
  upcomingEvents,
} from '../controllers/event.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { requireStaff } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createEventSchema,
  idParamSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from '../schemas.js';

const router = express.Router();

router.get('/', optionalAuth, validate({ query: listEventsQuerySchema }), asyncHandler(listEvents));
router.get('/upcoming', asyncHandler(upcomingEvents));

router.post(
  '/',
  requireAuth,
  requireStaff,
  validate({ body: createEventSchema }),
  asyncHandler(createEvent)
);
router.put(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema, body: updateEventSchema }),
  asyncHandler(updateEvent)
);
router.delete(
  '/:id',
  requireAuth,
  requireStaff,
  validate({ params: idParamSchema }),
  asyncHandler(deleteEvent)
);

export default router;
