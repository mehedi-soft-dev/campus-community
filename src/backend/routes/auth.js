import express from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import {
  register,
  login,
  logout,
  me,
  updateMe,
  changePassword,
} from '../controllers/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: env.authRateLimit.windowMs,
  limit: env.authRateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please try again later.', code: 'RATE_LIMITED' } },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(register));
router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(login));
router.post('/logout', asyncHandler(logout));

// Not gated on requireActive: a pending user needs to read their own status.
router.get('/me', requireAuth, asyncHandler(me));
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), asyncHandler(updateMe));
router.post(
  '/password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePassword)
);

export default router;
