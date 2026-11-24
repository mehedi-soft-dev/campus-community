import { useState } from 'react';
import { api, errorMessage, fieldErrors } from '../../api/axios.js';
import Loading from '../../components/Loading.jsx';
import Pager from '../../components/Pager.jsx';
import { invalidateCategories } from '../../hooks/useCategories.js';
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

const BLANK = { code: '', name: '', description: '', accentHue: 220, sortOrder: 0, isActive: true };

export default function Categories() {
  const { items, totalPages, page, setPage, status, reload } = useResource('/categories');
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const {
    remove,
    error: deleteError,
    clearError,
  } = useDelete('/categories', {
    onDone: () => {
      invalidateCategories();
      reload();
    },
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setEditId(null);
    setForm(BLANK);
    setErrors({});
  };

  const startEdit = (category) => {
    setEditId(category.id);
    setForm({
      code: category.code,
      name: category.name,
      description: category.description ?? '',
      accentHue: category.accentHue,
      sortOrder: category.sortOrder,
      isActive: Boolean(category.isActive),
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
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      accentHue: Number(form.accentHue),
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editId) {
        // `code` is immutable: the API's update schema omits it, so sending it
        // would be ignored anyway. The slug and every post reference follow it.
        delete payload.code;
        await api.put(`/categories/${editId}`, payload);
        setOk(`Updated "${payload.name}".`);
      } else {
        await api.post('/categories', payload);
        setOk(`Created "${payload.name}". It is available everywhere categories are used.`);
      }
      // The category list is cached module-wide for the public pages; without
      // this the new name would not appear until a full reload.
      invalidateCategories();
      reset();
      await reload();
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(
        Object.keys(fields).length ? fields : { form: errorMessage(err, 'Could not save.') }
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin__grid">
      <Panel
        title={editId ? `Edit category #${editId}` : 'New category'}
        note="Categories drive the chips, the colour dot and the section strip. A category cannot be deleted while any post still uses it."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <div className="admin-form__row">
            <Field
              label="Code"
              hint={editId ? 'Cannot be changed after creation.' : 'Lowercase letters, numbers and dashes. Used in URLs.'}
              error={errors.code}
            >
              <input
                value={form.code}
                onChange={(event) => set('code', event.target.value)}
                placeholder="sports"
                disabled={Boolean(editId)}
                maxLength={45}
              />
            </Field>

            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder="Sports"
                maxLength={120}
              />
            </Field>
          </div>

          <Field label="Description" hint="Shown as the standfirst on the category listing." error={errors.description}>
            <input
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Teams, tournaments and tryouts"
              maxLength={300}
            />
          </Field>

          <div className="admin-form__row">
            <Field label="Accent hue" hint="0-360. Drives the colour dot and card tint." error={errors.accentHue}>
              <input
                type="number"
                min="0"
                max="360"
                value={form.accentHue}
                onChange={(event) => set('accentHue', event.target.value)}
              />
            </Field>

            <Field label="Sort order" hint="Lower numbers appear first." error={errors.sortOrder}>
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
              {busy ? 'Saving…' : editId ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${items.length} categories`}>
        {status === 'loading' && <Loading label="Loading categories…" rows={2} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Code' },
              { label: 'Name' },
              { label: 'Hue', className: 'admin-table__num' },
              { label: 'Sort', className: 'admin-table__num' },
              { label: 'Posts', className: 'admin-table__num' },
              { label: 'Status' },
              { label: '' },
            ]}
          >
            {items.map((category) => (
              <tr key={category.id}>
                <td>
                  <code>{category.code}</code>
                </td>
                <td>
                  <span className="admin-table__title">{category.name}</span>
                  {category.description && (
                    <span className="admin-table__sub">{category.description}</span>
                  )}
                </td>
                <td className="admin-table__num">
                  <span
                    className="admin-dot"
                    style={{ background: `hsl(${category.accentHue} 70% 50%)` }}
                  />
                  {category.accentHue}
                </td>
                <td className="admin-table__num">{category.sortOrder}</td>
                <td className="admin-table__num">{category.postCount ?? 0}</td>
                <td>
                  <span className={`admin-pill ${category.isActive ? 'admin-pill--ok' : 'admin-pill--muted'}`}>
                    {category.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <RowActions>
                    <Action onClick={() => startEdit(category)}>Edit</Action>
                    <Action
                      danger
                      onClick={() =>
                        remove(
                          category.id,
                          `Delete "${category.name}"? Categories that already have posts cannot be deleted.`
                        )
                      }
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
