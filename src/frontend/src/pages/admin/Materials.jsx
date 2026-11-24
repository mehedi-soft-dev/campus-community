import { useEffect, useState } from 'react';
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

const TYPES = ['notes', 'slides', 'past_paper', 'syllabus', 'reference', 'other'];

const BLANK = {
  title: '',
  description: '',
  courseCode: '',
  departmentId: '',
  semester: '',
  materialType: 'notes',
  fileId: null,
  fileName: '',
};

export default function Materials() {
  const { items, total, totalPages, page, setPage, status, reload } = useResource('/materials');
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const { remove, error: deleteError, clearError } = useDelete('/materials', { onDone: reload });

  useEffect(() => {
    api
      .get('/departments')
      .then(({ data }) => setDepartments(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => setDepartments([]));
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setForm(BLANK);
    setErrors({});
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

    if (!form.fileId) {
      setErrors({ file: 'Upload the document first.' });
      return;
    }

    setBusy(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      courseCode: form.courseCode.trim() || null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      semester: form.semester.trim() || null,
      materialType: form.materialType,
      fileId: form.fileId,
    };

    try {
      await api.post('/materials', payload);
      setOk('Material published to the study materials board.');
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
        title="Upload study material"
        note="Community-contributed, so the board carries a 'not official' note. Anything wrong can be removed below."
      >
        <form className="admin-form" onSubmit={submit} noValidate>
          {errors.form && <div className="banner banner--error">{errors.form}</div>}

          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Class notes — CSE 2101"
              maxLength={200}
            />
          </Field>

          <Field label="Description (optional)" error={errors.description}>
            <input
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Covers chapters 1-5, including worked examples."
              maxLength={300}
            />
          </Field>

          <div className="admin-form__row">
            <Field label="Course code" error={errors.courseCode}>
              <input
                value={form.courseCode}
                onChange={(event) => set('courseCode', event.target.value)}
                placeholder="CSE 2101"
                maxLength={20}
              />
            </Field>

            <Field label="Department" error={errors.departmentId}>
              <select
                value={form.departmentId}
                onChange={(event) => set('departmentId', event.target.value)}
              >
                <option value="">No department</option>
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

            <Field label="Type" error={errors.materialType}>
              <select
                value={form.materialType}
                onChange={(event) => set('materialType', event.target.value)}
              >
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Document"
            hint={form.fileName ? `Attached: ${form.fileName}` : 'PDF, Office document, ZIP or an image.'}
            error={errors.file}
          >
            <input type="file" onChange={attach} />
          </Field>

          <div className="admin-form__actions">
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
              {busy ? 'Saving…' : 'Publish material'}
            </button>
          </div>
        </form>
      </Panel>

      <Feedback error={deleteError} ok={ok} onDismiss={() => { setOk(''); clearError(); }} />

      <Panel title={`${total} materials`}>
        {status === 'loading' && <Loading label="Loading materials…" rows={3} />}

        {status === 'ready' && (
          <AdminTable
            columns={[
              { label: 'Title' },
              { label: 'Course' },
              { label: 'Type' },
              { label: 'Downloads', className: 'admin-table__num' },
              { label: 'File' },
              { label: '' },
            ]}
          >
            {items.map((material) => (
              <tr key={material.id}>
                <td>
                  <span className="admin-table__title">{material.title}</span>
                  <span className="admin-table__sub">
                    {material.departmentCode ?? 'No department'}
                    {material.semester ? ` · ${material.semester}` : ''}
                  </span>
                </td>
                <td>{material.courseCode ?? '—'}</td>
                <td>
                  <span className="admin-pill admin-pill--muted">{material.materialType}</span>
                </td>
                <td className="admin-table__num">{material.downloadCount ?? 0}</td>
                <td>
                  {material.fileId ? (
                      <a href={`/api/materials/${material.id}/download`}>
                        {fileLabel(material.fileMime, material.fileName)}
                      </a>
                  ) : (
                    <span className="admin-pill admin-pill--warn">missing</span>
                  )}
                </td>
                <td>
                  <RowActions>
                    <Action danger onClick={() => remove(material.id, `Remove "${material.title}"?`)}>
                      Remove
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
