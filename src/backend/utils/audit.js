import { query } from '../db/pool.js';

/**
 * Writes a privileged action to audit_log. Best-effort: an audit failure must
 * never break the action it describes, so errors are logged and swallowed.
 */
export async function logAudit(req, { action, entityType, entityId = null, detail = null }) {
  try {
    await query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id ?? null,
        action,
        entityType,
        entityId,
        detail ? JSON.stringify(detail) : null,
        req.ip ?? null,
      ]
    );
  } catch (err) {
    console.error(`[audit] could not record ${action}: ${err.message}`);
  }
}
