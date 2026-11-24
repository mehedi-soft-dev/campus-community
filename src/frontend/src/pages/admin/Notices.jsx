import { useState } from 'react';
import moment from 'moment';
import { api, errorMessage, fieldErrors } from '../../api/axios.js';
import Loading from '../../components/Loading.jsx';
import Pager from '../../components/Pager.jsx';
import {
  Action,
  AdminTable,
  Feedback,
  Field,
  Panel,
  RowActions,
  useDelete,
  useResource,
  uploadFileObject,
} from './shared.jsx';

const CATEGORIES = ['general', 'exam', 'admission', 'result', 'event', 'scholarship'];
const PRIORITIES = ['normal', 'important', 'urgent'];
const STATUSES = ['published', 'draft', 'archived'];

const BLANK = {
  title: '',
  body: '',
  category: 'general',
  priority: 'normal',
  isPinned: false,
  status: 'published',
  publishAt: '',
  expiresAt: '',
  attachmentId: null,
  attachmentName: '',
};

export default function Notices() {
  const { items, total, totalPages, page, setPage, status, reload } = useResource('/notices');
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const { remove, error: deleteError, clearError } = useDelete('/notices', { onDone: reload });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setEditId(null);
    setForm(BLANK);
    setErrors({});
  };

  const startEdit = (notice) => {
    setEditId(notice.id);
    setForm({
      title: notice.title,
      body: notice.body,
      category: notice.category,
      priority: notice.priority,
      isPinned: Boolean(notice.isPinned),
      status: notice.status,
      publishAt: notice.publishAt ? new Date(notice.publishAt).toISOString().slice(0, 16) : '',
      expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : '',
      attachmentId: notice.attachmentId ?? null,
      attachmentName: notice.attachmentName ?? '',
    });
    setErrors({});
    setOk('');
  };

  const attach = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErrors({});
    try {
      const stored = await uploadFileObject(file);
      set('attachmentId', stored.id);
      set('attachmentName', stored.originalName);
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Could not upload that file.') });
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setOk('');
    clearError();

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      category: form.category,
      priority: form.priority,
      isPinned: form.isPinned,
      status: form.status,
      attachmentId: form.attachmentId || undefined,
      publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    try {
      if (editId) {
        await api.put(`/notices/${editId}`, payload);
        setOk('Notice updated.');
      } else {
        await api.post('/notices', payload);
        setOk('Notice published to the board.');
      }
      reset();
      await reload();
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(Object.keys(fields).length ? fields : { form: errorMessage(err, 'Could not save.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin__grid">
      <Panel
        title={editId ? `Edit notice #${editId}` : 'New notice'}
        note="Notices appear on the board, the front page and the ticker. Pinned ones sort to the top."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Midterm examination routine published"
              maxLength={200}
            />
          </Field>

          <Field label="Body" error={errors.body}>
            <textarea
              rows={5}
              value={form.body}
              onChange={(event) => set('body', event.target.value)}
              placeholder="The full announcement, as students should read it."
            />
          </Field>

          <div className="admin-form__row">
            <Field label="Category" error={errors.category}>
              <select value={form.category} onChange={(event) => set('category', event.target.value)}>
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority" error={errors.priority}>
              <select value={form.priority} onChange={(event) => set('priority', event.target.value)}>
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" error={errors.status}>
              <select value={form.status} onChange={(event) => set('status', event.target.value)}>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="admin-form__row">
            <Field label="Published at" hint="Leave blank to publish immediately." error={errors.publishAt}>
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={(event) => set('publishAt', event.target.value)}
              />
            </Field>

            <Field label="Expires at" hint="Blank means it never expires." error={errors.expiresAt}>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) => set('expiresAt', event.target.value)}
              />
            </Field>

            <div className="admin-field">
              <span className="admin-field__label">Options</span>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(event) => set('isPinned', event.target.checked)}
                />
                Pin to the top
              </label>
            </div>
          </div>

          <Field
            label="Attachment"
            hint={form.attachmentName ? `Attached: ${form.attachmentName}` : 'PDF, DOC, XLS, PPT or ZIP.'}
          >
            <input type="file" onChange={attach} />
          </Field>

          <div className="admin-form__actions">
            {editId && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
              {busy ? 'Saving…' : editId ? 'Save changes' : 'Publish notice'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${total} notices`}>
        {status === 'loading' && <Loading label="Loading notices…" rows={3} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Title' },
              { label: 'Category' },
              { label: 'Priority' },
              { label: 'Status' },
              { label: 'Published' },
              { label: '' },
            ]}
          >
            {items.map((notice) => (
              <tr key={notice.id}>
                <td>
                  <span className="admin-table__title">{notice.title}</span>
                  <span className="admin-table__sub">
                    {notice.author}
                    {notice.attachmentName ? ` · ${notice.attachmentName}` : ''}
                  </span>
                </td>
                <td>{notice.category}</td>
                <td>
                  <span className={`admin-pill ${notice.priority === 'urgent' ? 'admin-pill--warn' : ''}`}>
                    {notice.priority}
                  </span>
                </td>
                <td>
                  <span className={`admin-pill ${notice.status === 'published' ? 'admin-pill--ok' : 'admin-pill--muted'}`}>
                    {notice.status}
                  </span>
                </td>
                <td>{moment(notice.publishAt).format('DD/MM/YYYY')}</td>
                <td>
                  <RowActions>
                    <Action onClick={() => startEdit(notice)}>Edit</Action>
                    <Action
                      danger
                      onClick={() => remove(notice.id, `Archive "${notice.title}"?`)}
                    >
                      Archive
                    </Action>
                  </RowActions>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <Pager page={page} totalPages={totalPages} onChange={setPage} />
      </Panel>
    </div>
  );
}
