import { useEffect, useState } from 'react';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import Pager from '../components/Pager.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AdminLink from '../components/AdminLink.jsx';
import { useDepartments } from '../hooks/useDepartments.js';
import { fileLabel } from '../utils/media.js';
import { useReveal } from '../hooks/useReveal.js';

const EXAM_TYPES = ['', 'midterm', 'final', 'quiz', 'practical'];

// The API clamps pageSize at 50, so paging is the only way to reach older rows.
const PAGE_SIZE = 20;

export default function Routine() {
  const { departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState('');
  const [examType, setExamType] = useState('');

  const [routines, setRoutines] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle('Exam routine');

  const revealRef = useReveal([status, routines]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get('/routines', {
        params: {
          departmentId: departmentId || undefined,
          examType: examType || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setRoutines(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load routines.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [departmentId, examType, page]);

  // A filter change returns a new result set, so start again at page 1.
  useEffect(() => {
    setPage(1);
  }, [departmentId, examType]);

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Official</p>
        <h1>Exam routine</h1>
        <AdminLink to="/admin/routines">Upload a routine</AdminLink>
        <p className="hub__lede">
          The official routine documents published by the university. Download the file for the
          authoritative version.
        </p>
      </header>

      <div className="hub__filters">
        <select
          className="hub__select"
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.code} — {department.name}
            </option>
          ))}
        </select>

        <select
          className="hub__select"
          value={examType}
          onChange={(event) => setExamType(event.target.value)}
          aria-label="Filter by exam type"
        >
          {EXAM_TYPES.map((type) => (
            <option key={type || 'all'} value={type}>
              {type ? type[0].toUpperCase() + type.slice(1) : 'All exams'}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading routines…" rows={3} />}

      {status === 'ready' && routines.length === 0 && (
        <div className="empty-state">
          <h2>No routines published</h2>
          <p>A moderator or admin uploads the official routine document here.</p>
        </div>
      )}

      {status === 'ready' && routines.length > 0 && (
        <div className="board fade-swap">
          <div className="board__title">
            <h2>Exam Routine</h2>
            <span>
              {routines.length} document{routines.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="board__scroll">
            <table>
              <thead>
                <tr>
                  <th className="board__sl">Sl.</th>
                  <th>Routine</th>
                  <th className="board__date">Published</th>
                  <th className="board__file">File</th>
                </tr>
              </thead>

              <tbody>
                {routines.map((routine, index) => (
                  <tr key={routine.id}>
                    <td className="board__sl">{index + 1}</td>

                    <td className="board__subject">
                      {routine.title}
                      <span className="board__meta">
                        {[
                          routine.examType,
                          routine.departmentCode,
                          routine.semester,
                          routine.effectiveFrom
                            ? `effective ${moment(routine.effectiveFrom).format('DD/MM/YYYY')}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </td>

                    <td className="board__date">
                      {moment(routine.createdAt).format('DD/MM/YYYY')}
                    </td>

                    <td className="board__file">
                      <span className="board__file-actions">
                        <a
                          href={`/uploads/${routine.fileFilename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View ${routine.fileName}`}
                        >
                          {fileLabel(routine.fileMime, routine.fileName)}
                        </a>
                        <a
                          className="board__download"
                          href={`/api/routines/${routine.id}/download`}
                          title={`Download ${routine.fileName}`}
                          aria-label={`Download ${routine.fileName}`}
                        >
                          ↓
                        </a>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} onChange={setPage} label="Routine pages" />
    </div>
  );
}
