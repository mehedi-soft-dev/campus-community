import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Loads the account for a valid token. Role and status are read from the
 * database rather than the token payload on purpose: roles and suspensions
 * change at runtime, and a 7-day token would otherwise keep stale privileges
 * alive after a demotion.
 */
async function resolveUser(req) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch {
    return undefined; // present but invalid — distinct from "no token"
  }

  const [user] = await query(
    'SELECT id, username, role, status FROM users WHERE id = ? LIMIT 1',
    [payload.id]
  );
  return user ?? null;
}

/** Requires a valid session. */
export async function requireAuth(req, res, next) {
  try {
    const user = await resolveUser(req);

    if (user === undefined) return next(ApiError.forbidden('Token is not valid!'));
    if (!user) return next(ApiError.unauthorized());

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Populates req.user when a valid session exists, but never rejects. Used on
 * public endpoints that change their response for the signed-in viewer — e.g.
 * seeing your own removed post, or your own rating on a post.
 */
export async function optionalAuth(req, res, next) {
  try {
    const user = await resolveUser(req);
    req.user = user ?? null;
    return next();
  } catch (err) {
    return next(err);
  }
}
