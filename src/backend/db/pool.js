import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  // MySQL stores DATETIME with no timezone, and the server writes UTC
  // (CURRENT_TIMESTAMP on a UTC clock). mysql2 otherwise assumes the values are
  // in the Node process's local zone, which shifted every timestamp by the
  // host's offset — a post created "now" in Dhaka displayed as 6 hours old.
  // Declaring the server zone as Z makes reads and writes unambiguously UTC;
  // the browser then converts to the reader's local time.
  timezone: 'Z',
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function closePool() {
  await pool.end();
}
