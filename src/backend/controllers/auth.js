import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { ApiError } from '../utils/ApiError.js';

const BCRYPT_ROUNDS = 12;

// Shared by login (set) and logout (clear) so the flags always match.
export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.cookieSecure,
  path: '/',
};

export async function register(req, res) {
  const { username, email, password, fullName, batch, departmentId } = req.validated.body;

  const existing = await query(
    'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
    [email, username]
  );
  if (existing.length) throw ApiError.conflict('User already exists!');

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // New accounts start pending: an admin or moderator has to approve them.
  const result = await query(
    `INSERT INTO users (username, email, password, role, status, full_name, batch, department_id)
     VALUES (?, ?, ?, 'user', 'pending', ?, ?, ?)`,
    [username, email, hash, fullName || null, batch || null, departmentId || null]
  );

  res.status(201).json({
    id: result.insertId,
    username,
    status: 'pending',
    message: 'Account created. A moderator will review it before you can sign in.',
  });
}

export async function login(req, res) {
  const { username, password } = req.validated.body;

  const [user] = await query('SELECT id, password, status FROM users WHERE username = ? LIMIT 1', [
    username,
  ]);

  // One response for "no such user" and "wrong password" so the endpoint cannot
  // be used to enumerate usernames.
  const invalid = new ApiError(401, 'Wrong username or password!', 'INVALID_CREDENTIALS');
  if (!user) throw invalid;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw invalid;

  if (user.status === 'pending') {
    throw new ApiError(
      403,
      'Your account is awaiting approval by a moderator.',
      'ACCOUNT_PENDING'
    );
  }
  if (user.status === 'suspended') {
    throw new ApiError(403, 'This account has been suspended.', 'ACCOUNT_SUSPENDED');
  }

  const token = jwt.sign({ id: user.id }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

  const [profile] = await query(
    `SELECT
       u.id, u.username, u.email, u.img, u.role, u.status,
       u.full_name AS fullName, u.bio, u.batch, u.department_id AS departmentId,
       d.name AS departmentName
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = ?`,
    [user.id]
  );

  res
    .cookie(env.cookieName, token, { ...authCookieOptions, maxAge: env.cookieMaxAgeMs })
    .status(200)
    .json(profile);
}

export async function logout(req, res) {
  res
    .clearCookie(env.cookieName, authCookieOptions)
    .status(200)
    .json({ message: 'User has been logged out.' });
}

export async function me(req, res) {
  const [profile] = await query(
    `SELECT
       u.id, u.username, u.email, u.img, u.role, u.status,
       u.full_name AS fullName, u.bio, u.batch, u.department_id AS departmentId,
       d.name AS departmentName
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = ?`,
    [req.user.id]
  );
  if (!profile) throw ApiError.unauthorized();
  res.json(profile);
}

export async function updateMe(req, res) {
  const { fullName, bio, batch, img, departmentId } = req.validated.body;

  const fields = [];
  const params = [];
  const set = (column, value) => {
    if (value !== undefined) {
      fields.push(`${column} = ?`);
      params.push(value);
    }
  };

  set('full_name', fullName);
  set('bio', bio);
  set('batch', batch);
  set('img', img);
  set('department_id', departmentId);

  if (!fields.length) throw ApiError.badRequest('Nothing to update.');

  await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, req.user.id]);

  const [profile] = await query(
    `SELECT
       u.id, u.username, u.email, u.img, u.role, u.status,
       u.full_name AS fullName, u.bio, u.batch, u.department_id AS departmentId,
       d.name AS departmentName
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = ?`,
    [req.user.id]
  );
  res.json(profile);
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body;

  const [user] = await query('SELECT password FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  if (!user) throw ApiError.unauthorized();

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) throw new ApiError(400, 'Current password is incorrect.', 'WRONG_PASSWORD');

  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

  res.json({ message: 'Password updated.' });
}
