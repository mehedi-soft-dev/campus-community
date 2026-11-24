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

const TYPES = ['', 'notes', 'slides', 'past_paper', 'syllabus', 'reference', 'other'];

// The API clamps pageSize at 50, so paging is the only way past it.
const PAGE_SIZE = 20;

export default function Materials() {
  const { departments } = useDepartments();

  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle('Study materials');

  const revealRef = useReveal([status, items]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get('/materials', {
        params: {
          q: applied || undefined,
          materialType: materialType || undefined,
          departmentId: departmentId || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load materials.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [applied, materialType, departmentId, page]);

  // A filter change returns a new result set, so start again at page 1.
  useEffect(() => {
    setPage(1);
  }, [applied, materialType, departmentId]);

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Community contributed</p>
        <h1>Study materials</h1>
        <AdminLink to="/admin/materials">Upload material</AdminLink>
        <p className="hub__lede">
          Notes, slides and past papers shared by students. These are <strong>not official</strong>{' '}
          university material — always check with your department.
        </p>
      </header>

      <form
        className="hub__filters"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(query.trim());
        }}
      >
        <input
          className="hub__search"
          type="search"
          placeholder="Search title, course code…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="hub__select"
          value={materialType}
          onChange={(event) => setMaterialType(event.target.value)}
          aria-label="Filter by type"
        >
          {TYPES.map((type) => (
            <option key={type || 'all'} value={type}>
              {type ? type.replace('_', ' ') : 'All types'}
            </option>
          ))}
        </select>
        <select
          className="hub__select"
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.code}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--primary btn--sm">
          Search
        </button>
      </form>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading materials…" rows={3} />}

      {status === 'ready' && items.length === 0 && (
        <div className="empty-state">
          <h2>Nothing here yet</h2>
          <p>No materials match those filters.</p>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <div className="board fade-swap">
          <div className="board__title">
            <h2>Study Materials</h2>
            <span>
              {items.length} file{items.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="board__scroll">
            <table>
              <thead>
                <tr>
                  <th className="board__sl">Sl.</th>
                  <th>Material</th>
                  <th className="board__date">Added</th>
                  <th className="board__file">File</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="board__sl">{index + 1}</td>

                    <td className="board__subject">
                      {item.title}
                      <span className="board__meta">
                        {[
                          item.courseCode,
                          item.departmentCode,
                          item.materialType.replace('_', ' '),
                          `by ${item.uploadedBy}`,
                          `${item.downloadCount} download${item.downloadCount === 1 ? '' : 's'}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </td>

                    <td className="board__date">{moment(item.createdAt).format('DD/MM/YYYY')}</td>

                    <td className="board__file">
                      <span className="board__file-actions">
                        <a
                          href={`/uploads/${item.fileFilename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View ${item.fileName}`}
                        >
                          {fileLabel(item.fileMime, item.fileName)}
                        </a>
                        <a
                          className="board__download"
                          href={`/api/materials/${item.id}/download`}
                          title={`Download ${item.fileName}`}
                          aria-label={`Download ${item.fileName}`}
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

      <Pager page={page} totalPages={totalPages} onChange={setPage} label="Material pages" />
    </div>
  );
}
