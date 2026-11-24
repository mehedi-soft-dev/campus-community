import { useState } from 'react';
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

const BLANK = { code: '', name: '', faculty: '', sortOrder: 0, isActive: true };

export default function Departments() {
  const { items, totalPages, page, setPage, status, reload } = useResource('/departments');
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const { remove, error: deleteError, clearError } = useDelete('/departments', { onDone: reload });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setEditId(null);
    setForm(BLANK);
    setErrors({});
  };

  const startEdit = (department) => {
    setEditId(department.id);
    setForm({
      code: department.code,
      name: department.name,
      faculty: department.faculty ?? '',
      sortOrder: department.sortOrder,
      isActive: Boolean(department.isActive),
    });
    setErrors({});
    setOk('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setOk('');
    clearError();

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editId) {
        delete payload.code; // immutable after creation
        await api.put(`/departments/${editId}`, payload);
        setOk(`Updated "${payload.name}".`);
      } else {
        await api.post('/departments', payload);
        setOk(`Created "${payload.name}".`);
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
        title={editId ? `Edit department #${editId}` : 'New department'}
        note="Departments are the filter on exam routines and study materials."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <div className="admin-form__row">
            <Field label="Code" hint={editId ? 'Cannot be changed.' : 'Uppercase, e.g. CSE.'} error={errors.code}>
              <input
                value={form.code}
                onChange={(event) => set('code', event.target.value)}
                placeholder="CSE"
                disabled={Boolean(editId)}
                maxLength={20}
              />
            </Field>

            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder="Computer Science & Engineering"
                maxLength={140}
              />
            </Field>
          </div>

          <div className="admin-form__row">
            <Field label="Faculty" error={errors.faculty}>
              <input
                value={form.faculty}
                onChange={(event) => set('faculty', event.target.value)}
                placeholder="Faculty of Science & Technology"
                maxLength={140}
              />
            </Field>

            <Field label="Sort order" error={errors.sortOrder}>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) => set('sortOrder', event.target.value)}
              />
            </Field>

            <div className="admin-field">
              <span className="admin-field__label">Visibility</span>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => set('isActive', event.target.checked)}
                />
                Active
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
              {busy ? 'Saving…' : editId ? 'Save changes' : 'Create department'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${items.length} departments`}>
        {status === 'loading' && <Loading label="Loading departments…" rows={2} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Code' },
              { label: 'Name' },
              { label: 'Sort', className: 'admin-table__num' },
              { label: 'Status' },
              { label: '' },
            ]}
          >
            {items.map((department) => (
              <tr key={department.id}>
                <td>
                  <code>{department.code}</code>
                </td>
                <td>
                  <span className="admin-table__title">{department.name}</span>
                  {department.faculty && <span className="admin-table__sub">{department.faculty}</span>}
                </td>
                <td className="admin-table__num">{department.sortOrder}</td>
                <td>
                  <span className={`admin-pill ${department.isActive ? 'admin-pill--ok' : 'admin-pill--muted'}`}>
                    {department.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <RowActions>
                    <Action onClick={() => startEdit(department)}>Edit</Action>
                    <Action
                      danger
                      onClick={() => remove(department.id, `Delete "${department.name}"?`)}
                    >
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
