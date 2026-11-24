import { useEffect, useState } from 'react';
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
} from './shared.jsx';

const KINDS = ['event', 'holiday', 'exam_week', 'deadline', 'registration', 'result'];
const STATUSES = ['published', 'draft', 'archived'];

const BLANK = {
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  allDay: false,
  location: '',
  departmentId: '',
  kind: 'event',
  isFeatured: false,
  status: 'published',
};

export default function Events() {
  const { items, total, totalPages, page, setPage, status, reload } = useResource('/events');
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const { remove, error: deleteError, clearError } = useDelete('/events', { onDone: reload });

  useEffect(() => {
    api
      .get('/departments')
      .then(({ data }) => setDepartments(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => setDepartments([]));
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setEditId(null);
    setForm(BLANK);
    setErrors({});
  };

  const startEdit = (event) => {
    setEditId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? '',
      startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
      endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '',
      allDay: Boolean(event.allDay),
      location: event.location ?? '',
      departmentId: event.departmentId ? String(event.departmentId) : '',
      kind: event.kind,
      isFeatured: Boolean(event.isFeatured),
      status: event.status,
    });
    setErrors({});
    setOk('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (!form.startsAt) {
      setErrors({ startsAt: 'A start date and time is required.' });
      return;
    }

    setOk('');
    clearError();
    setBusy(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      allDay: form.allDay,
      location: form.location.trim() || null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      kind: form.kind,
      isFeatured: form.isFeatured,
      status: form.status,
    };

    try {
      if (editId) {
        await api.put(`/events/${editId}`, payload);
        setOk('Calendar entry updated.');
      } else {
        await api.post('/events', payload);
        setOk('Added to the academic calendar.');
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
        title={editId ? `Edit calendar entry #${editId}` : 'New calendar entry'}
        note="Events and academic-calendar entries share one table — `kind` is what separates them."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Midterm week"
              maxLength={200}
            />
          </Field>

          <Field label="Description (optional)" error={errors.description}>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="What students need to know."
            />
          </Field>

          <div className="admin-form__row">
            <Field label="Starts at" error={errors.startsAt}>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => set('startsAt', event.target.value)}
              />
            </Field>

            <Field label="Ends at (optional)" error={errors.endsAt}>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => set('endsAt', event.target.value)}
              />
            </Field>
          </div>

          <div className="admin-form__row">
            <Field label="Kind" error={errors.kind}>
              <select value={form.kind} onChange={(event) => set('kind', event.target.value)}>
                {KINDS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Location (optional)" error={errors.location}>
              <input
                value={form.location}
                onChange={(event) => set('location', event.target.value)}
                placeholder="Main auditorium"
                maxLength={160}
              />
            </Field>

            <Field label="Department" error={errors.departmentId}>
              <select
                value={form.departmentId}
                onChange={(event) => set('departmentId', event.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.code}
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
            <div className="admin-field">
              <span className="admin-field__label">Options</span>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(event) => set('allDay', event.target.checked)}
                />
                All day
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => set('isFeatured', event.target.checked)}
                />
                Feature on the front page
              </label>
            </div>
          </div>

          <div className="admin-form__actions">
            {editId && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
              {busy ? 'Saving…' : editId ? 'Save changes' : 'Add to calendar'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${total} calendar entries`}>
        {status === 'loading' && <Loading label="Loading the calendar…" rows={3} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Title' },
              { label: 'Kind' },
              { label: 'Starts', className: 'admin-table__num' },
              { label: 'Location' },
              { label: 'Status' },
              { label: '' },
            ]}
          >
            {items.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className="admin-table__title">{entry.title}</span>
                  {entry.isFeatured && <span className="admin-table__sub">featured</span>}
                </td>
                <td>
                  <span className={`admin-pill ${entry.kind === 'exam_week' ? 'admin-pill--warn' : 'admin-pill--muted'}`}>
                    {entry.kind}
                  </span>
                </td>
                <td className="admin-table__num">
                  {moment(entry.startsAt).format('DD/MM/YYYY HH:mm')}
                </td>
                <td>{entry.location ?? '—'}</td>
                <td>
                  <span className={`admin-pill ${entry.status === 'published' ? 'admin-pill--ok' : 'admin-pill--muted'}`}>
                    {entry.status}
                  </span>
                </td>
                <td>
                  <RowActions>
                    <Action onClick={() => startEdit(entry)}>Edit</Action>
                    <Action danger onClick={() => remove(entry.id, `Delete "${entry.title}"?`)}>
                      Delete
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
