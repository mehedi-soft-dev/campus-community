import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/axios.js';

/**
 * GET a paginated list endpoint. `params` is compared by value so callers can
 * pass an inline object without causing a refetch loop.
 *
 * Paging lives here rather than in each tab: every one of these lists used to
 * request a fixed 50 rows and never ask for page two, and the API clamps
 * pageSize at 50 — so row 51 was unreachable.
 */
export function useResource(path, params = {}, pageSize = 20) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const key = JSON.stringify(params);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const { data } = await api.get(path, { params: { ...params, page, pageSize } });
      // Some endpoints return a bare array (categories), others a page object.
      const list = Array.isArray(data) ? data : (data.items ?? []);
      const paged = !Array.isArray(data);
      setItems(list);
      setTotal(paged ? (data.total ?? list.length) : list.length);
      setTotalPages(paged ? (data.totalPages ?? 1) : 1);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err, 'Could not load this list.'));
      setStatus('error');
    }
  }, [path, key, page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // New filters mean a new result set, so go back to the first page.
  useEffect(() => {
    setPage(1);
  }, [key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, total, totalPages, page, setPage, status, error, reload };
}

export function Panel({ title, actions, children, note }) {
  return (
    <section className="panel">
      <header className="panel__head">
        <h3>{title}</h3>
        {actions}
      </header>
      {note && <p className="admin-note">{note}</p>}
      {children}
    </section>
  );
}

export function AdminTable({ columns, children }) {
  return (
    <div className="admin-tablewrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} className={column.className}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function RowActions({ children }) {
  return <div className="admin-table__actions">{children}</div>;
}

export function Action({ onClick, danger, children }) {
  return (
    <button
      type="button"
      className={`admin-action ${danger ? 'admin-action--danger' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** One place for the "did it work" message, so every tab reports the same way. */
export function Feedback({ error, ok, onDismiss }) {
  if (!error && !ok) return null;
  return (
    <div className={`banner ${error ? 'banner--error' : 'banner--ok'}`}>
      <span>{error || ok}</span>
      {onDismiss && (
        <button type="button" className="admin-action" onClick={onDismiss}>
          dismiss
        </button>
      )}
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      {children}
      {hint && <em className="admin-field__hint">{hint}</em>}
      {error && <em className="admin-field__error">{error}</em>}
    </label>
  );
}

/** Shared delete confirmation + error capture. */
export function useDelete(path, { onDone } = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async (id, question = 'Delete this?') => {
    if (!window.confirm(question)) return false;
    setBusy(true);
    setError('');
    try {
      await api.delete(`${path}/${id}`);
      await onDone?.();
      return true;
    } catch (err) {
      setError(errorMessage(err, 'Could not delete that.'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { remove, busy, error, clearError: () => setError('') };
}

/** Uploads a document/image and returns its stored row (routines and materials need the id). */
export async function uploadFileObject(file) {
  const body = new FormData();
  body.append('file', file);
  const { data } = await api.post('/upload', body);
  return data;
}

/** <input type="datetime-local"> value -> ISO string, which the API accepts. */
export const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

/** ISO string -> the value a datetime-local input expects. */
export const fromIso = (value) => (value ? new Date(value).toISOString().slice(0, 16) : '');
