import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import Pager from '../components/Pager.jsx';
import { fileLabel, isImageFile } from '../utils/media.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AdminLink from '../components/AdminLink.jsx';
import { useReveal } from '../hooks/useReveal.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'exam', label: 'Exam' },
  { value: 'admission', label: 'Admission' },
  { value: 'result', label: 'Result' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'general', label: 'General' },
];

// Notice boards tag anything recent, so students can see what is fresh.
const isNew = (date) => moment().diff(moment(date), 'days') <= 7;

// The API clamps pageSize at 50, so paging is the only way to reach older rows.
const PAGE_SIZE = 20;

export default function Notices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle('Notice board');

  const revealRef = useReveal([status, notices]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get('/notices', {
        params: { category: category || undefined, page, pageSize: PAGE_SIZE },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setNotices(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load notices.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [category, page]);

  const setFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('category', value);
    else next.delete('category');
    // A new filter means a new result set, so start at page 1.
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage === 1) next.delete('page');
    else next.set('page', String(nextPage));
    setSearchParams(next);
  };

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Official</p>
        <h1>Notice board</h1>
        <AdminLink to="/admin/notices">Publish a notice</AdminLink>
        <p className="hub__lede">
          Announcements published by university staff. Pinned notices stay at the top and expired
          ones drop off automatically.
        </p>
      </header>

      <div className="hub__filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            className={`chip ${category === filter.value ? 'chip--active' : ''}`}
            onClick={() => setFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading notices…" rows={4} />}

      {status === 'ready' && notices.length === 0 && (
        <div className="empty-state">
          <h2>No notices yet</h2>
          <p>Nothing has been published in this category.</p>
        </div>
      )}

      {status === 'ready' && notices.length > 0 && (
        <div className="board fade-swap">
          <div className="board__title">
            <h2>Notice Board</h2>
            <span>
              {total} notice{total === 1 ? '' : 's'}
            </span>
          </div>

          <div className="board__scroll">
            <table>
              <thead>
                <tr>
                  <th className="board__sl">Sl.</th>
                  <th>Subject</th>
                  <th className="board__date">Date</th>
                  <th className="board__file">File</th>
                </tr>
              </thead>

              <tbody>
                {notices.map((notice, index) => (
                  <tr
                    key={notice.id}
                    className={notice.priority === 'urgent' ? 'board__row--urgent' : undefined}
                  >
                    <td className="board__sl">{index + 1}</td>

                    <td className="board__subject">
                      <Link to={`/notices/${notice.id}`}>{notice.title}</Link>
                      {isNew(notice.publishAt) && (
                        <span className="board__marker board__marker--new">New</span>
                      )}
                      {notice.priority === 'urgent' && <span className="board__marker">Urgent</span>}
                      {/* MySQL returns TINYINT as 0/1, and `0 && <span>` renders a
                          literal "0" — so this has to be an explicit boolean. */}
                      {Boolean(notice.isPinned) && (
                        <span className="board__marker board__marker--pin">Pinned</span>
                      )}
                      <span className="board__meta">
                        {notice.category} · by {notice.author}
                        {notice.expiresAt
                          ? ` · expires ${moment(notice.expiresAt).format('DD/MM/YYYY')}`
                          : ''}
                      </span>
                    </td>

                    <td className="board__date">
                      {moment(notice.publishAt).format('DD/MM/YYYY')}
                    </td>

                    <td className="board__file">
                      {notice.attachmentId ? (
                        <span className="board__file-actions">
                          {isImageFile(notice.attachmentMime) ? (
                            <a
                              href={`/uploads/${notice.attachmentFilename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="board__thumb"
                              title={`View ${notice.attachmentName ?? 'image'}`}
                            >
                              <img
                                src={`/uploads/${notice.attachmentFilename}`}
                                alt={notice.attachmentName ?? 'Attachment'}
                                loading="lazy"
                              />
                            </a>
                          ) : (
                            <a
                              href={`/uploads/${notice.attachmentFilename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`View ${notice.attachmentName ?? 'attachment'}`}
                            >
                              {fileLabel(notice.attachmentMime, notice.attachmentName)}
                            </a>
                          )}

                          <a
                            className="board__download"
                            href={`/api/files/${notice.attachmentId}/download`}
                            title={`Download ${notice.attachmentName ?? 'attachment'}`}
                            aria-label={`Download ${notice.attachmentName ?? 'attachment'}`}
                          >
                            ↓
                          </a>
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} onChange={setPage} label="Notice pages" />
    </div>
  );
}
