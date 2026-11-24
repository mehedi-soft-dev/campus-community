import { ApiError } from '../utils/ApiError.js';

/** Account must be approved (status = 'active'). */
export function requireActive(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());

  if (req.user.status === 'pending') {
    return next(
      new ApiError(403, 'Your account is awaiting approval by a moderator.', 'ACCOUNT_PENDING')
    );
  }
  if (req.user.status === 'suspended') {
    return next(new ApiError(403, 'This account has been suspended.', 'ACCOUNT_SUSPENDED'));
  }
  return next();
}

/** Role allow-list. Must run after requireAuth. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to do that.'));
    }
    return next();
  };
}

export const requireStaff = requireRole('admin', 'moderator');
export const requireAdmin = requireRole('admin');

/** Owner, or any moderator/admin. */
export function isOwnerOrStaff(user, ownerId) {
  if (!user) return false;
  return user.id === ownerId || user.role === 'admin' || user.role === 'moderator';
}
