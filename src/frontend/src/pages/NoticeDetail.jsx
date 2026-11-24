import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import { isImageFile } from '../utils/media.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle(notice?.title);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get(`/notices/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setNotice(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load this notice.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status !== 'ready') {
    return (
      <div className="hub">
        {status === 'loading' ? (
          <Loading label="Loading notice…" rows={4} />
        ) : (
          <div className="empty-state">
            <h2>{error}</h2>
            <Link className="btn btn--primary" to="/notices">
              Back to the notice board
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hub hub--narrow">
      <Link to="/notices" className="hub__back">
        ← Notice board
      </Link>

      <article className="notice-detail fade-swap">
        <div className="notice__top">
          <span className="badge badge--official">Official</span>
          <span className="badge badge--neutral">{notice.category}</span>
          {notice.priority !== 'normal' && (
            <span className={`badge badge--${notice.priority}`}>{notice.priority}</span>
          )}
        </div>

        <h1>{notice.title}</h1>

        <p className="notice-detail__meta">
          Published {moment(notice.publishAt).format('D MMMM YYYY')} by {notice.author}
          {notice.expiresAt
            ? ` · expires ${moment(notice.expiresAt).format('D MMMM YYYY')}`
            : ''}
        </p>

        {/* Plain text on purpose: notices cannot inject markup. */}
        <div className="notice-detail__body">{notice.body}</div>

        {notice.attachmentId != null && (
          <div className="notice-detail__attachment">
            {isImageFile(notice.attachmentMime) ? (
              <figure className="notice-detail__figure">
                <a
                  href={`/uploads/${notice.attachmentFilename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`/uploads/${notice.attachmentFilename}`}
                    alt={notice.attachmentName ?? 'Notice attachment'}
                  />
                </a>
                <figcaption>{notice.attachmentName}</figcaption>
              </figure>
            ) : (
              <p className="notice-detail__filename">
                Attachment: {notice.attachmentName}
              </p>
            )}

            {/* View opens the file inline (browsers render PDFs and images);
                Download forces Content-Disposition: attachment. */}
            <div className="notice-detail__actions">
              <a
                className="btn btn--ghost btn--sm"
                href={`/uploads/${notice.attachmentFilename}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
              <a
                className="btn btn--primary btn--sm"
                href={`/api/files/${notice.attachmentId}/download`}
              >
                Download
              </a>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
