import { useEffect, useState } from 'react';
import moment from 'moment';
import { api, errorMessage, fieldErrors } from '../../api/axios.js';
import Loading from '../../components/Loading.jsx';
import Pager from '../../components/Pager.jsx';
import { fileLabel } from '../../utils/media.js';
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

const EXAM_TYPES = ['final', 'midterm', 'quiz', 'practical'];
const STATUSES = ['published', 'draft', 'archived'];

const BLANK = {
  title: '',
  departmentId: '',
  semester: '',
  examType: 'final',
  effectiveFrom: '',
  notes: '',
  status: 'published',
  fileId: null,
  fileName: '',
};

export default function Routines() {
  const { items, total, totalPages, page, setPage, status, reload } = useResource('/routines');
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const { remove, error: deleteError, clearError } = useDelete('/routines', { onDone: reload });

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

  const startEdit = (routine) => {
    setEditId(routine.id);
    setForm({
      title: routine.title,
      departmentId: routine.departmentId ? String(routine.departmentId) : '',
      semester: routine.semester ?? '',
      examType: routine.examType,
      effectiveFrom: routine.effectiveFrom
        ? new Date(routine.effectiveFrom).toISOString().slice(0, 10)
        : '',
      notes: routine.notes ?? '',
      status: routine.status,
      fileId: routine.fileId,
      fileName: routine.fileName ?? '',
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
      set('fileId', stored.id);
      set('fileName', stored.originalName);
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Could not upload that file.') });
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setOk('');
    clearError();

    // The document is the point of a routine, so refuse to create one without it.
    if (!form.fileId) {
      setErrors({ file: 'Upload the routine document first.' });
      return;
    }

    setBusy(true);

    const payload = {
      title: form.title.trim(),
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      semester: form.semester.trim() || null,
      examType: form.examType,
      status: form.status,
      notes: form.notes.trim() || null,
      effectiveFrom: form.effectiveFrom ? new Date(form.effectiveFrom).toISOString() : null,
      fileId: form.fileId,
    };

    try {
      if (editId) {
        await api.put(`/routines/${editId}`, payload);
        setOk('Routine updated.');
      } else {
        await api.post('/routines', payload);
        setOk('Routine published.');
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
        title={editId ? `Edit routine #${editId}` : 'New exam routine'}
        note="Students want the registrar's exact document, so every routine needs an uploaded file."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Final examination routine — Spring 2026"
              maxLength={200}
            />
          </Field>

          <div className="admin-form__row">
            <Field label="Department" hint="Blank applies to every department." error={errors.departmentId}>
              <select
                value={form.departmentId}
                onChange={(event) => set('departmentId', event.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.code} — {department.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Semester" error={errors.semester}>
              <input
                value={form.semester}
                onChange={(event) => set('semester', event.target.value)}
                placeholder="Spring 2026"
                maxLength={30}
              />
            </Field>

            <Field label="Exam type" error={errors.examType}>
              <select value={form.examType} onChange={(event) => set('examType', event.target.value)}>
                {EXAM_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="admin-form__row">
            <Field label="Effective from" error={errors.effectiveFrom}>
              <input
                type="date"
                value={form.effectiveFrom}
                onChange={(event) => set('effectiveFrom', event.target.value)}
              />
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

          <Field label="Note (optional)" hint="Shown next to the download link." error={errors.notes}>
            <input
              value={form.notes}
              onChange={(event) => set('notes', event.target.value)}
              placeholder="Applies to all departments"
              maxLength={300}
            />
          </Field>

          <Field
            label="Routine document"
            hint={form.fileName ? `Attached: ${form.fileName}` : 'PDF or Office document.'}
            error={errors.file}
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
              {busy ? 'Saving…' : editId ? 'Save changes' : 'Publish routine'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${total} routines`}>
        {status === 'loading' && <Loading label="Loading routines…" rows={2} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Title' },
              { label: 'Department' },
              { label: 'Semester' },
              { label: 'Type' },
              { label: 'File' },
              { label: 'Status' },
              { label: '' },
            ]}
          >
            {items.map((routine) => (
              <tr key={routine.id}>
                <td>
                  <span className="admin-table__title">{routine.title}</span>
                  <span className="admin-table__sub">{routine.createdBy}</span>
                </td>
                <td>{routine.departmentCode ?? 'All'}</td>
                <td>{routine.semester ?? '—'}</td>
                <td>{routine.examType}</td>
                <td>
                  {routine.fileId ? (
                      <a href={`/api/routines/${routine.id}/download`}>
                        {fileLabel(routine.fileMime, routine.fileName)}
                      </a>
                  ) : (
                    <span className="admin-pill admin-pill--warn">missing</span>
                  )}
                </td>
                <td>
                  <span className={`admin-pill ${routine.status === 'published' ? 'admin-pill--ok' : 'admin-pill--muted'}`}>
                    {routine.status}
                  </span>
                </td>
                <td>
                  <RowActions>
                    <Action onClick={() => startEdit(routine)}>Edit</Action>
                    <Action danger onClick={() => remove(routine.id, `Delete "${routine.title}"?`)}>
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
