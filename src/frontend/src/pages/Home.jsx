import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import CoverArt from '../components/CoverArt.jsx';
import PostMetrics from '../components/PostMetrics.jsx';
import Loading from '../components/Loading.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/authContext.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useReveal } from '../hooks/useReveal.js';
import { initials, mediaUrl } from '../utils/media.js';

// The home page is the FRONT PAGE of a publication, not an archive and not a
// landing page: a nameplate, one lead story, a row of secondary stories, a
// notice board and a short index. Everything longer lives on /posts. Sections
// with nothing to show are omitted rather than rendered as empty boxes.
const SECONDARY_COUNT = 2;
const LIST_ROWS = 8;
const DATE = 'DD/MM/YYYY';

const excerpt = (html = '', max = 200) => {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.replace(/[.,;:!?\s]+$/, '')}…`;
};

const Cover = ({ post, className }) =>
  post.img ? (
    <img src={mediaUrl(post.img)} alt="" loading="lazy" />
  ) : (
    <CoverArt hue={post.categoryHue ?? 220} variant={post.id} />
  );

export default function Home() {
  const { currentUser } = useAuth();
  const { categories } = useCategories();

  // The front page is the site, so it takes the bare site title.
  usePageTitle();

  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const revealRef = useReveal([status, posts, notices, events, categories.length]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');

    api
      .get('/posts', { params: { sort: 'latest', pageSize: 20 } })
      .then(({ data }) => {
        if (cancelled) return;
        setPosts(data.items ?? []);
        setTotal(data.total ?? 0);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load the front page.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The front page also carries the "what is happening" material.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get('/notices', { params: { pageSize: 8 } }).catch(() => null),
      api.get('/events/upcoming', { params: { limit: 4 } }).catch(() => null),
    ]).then(([noticeRes, eventRes]) => {
      if (cancelled) return;
      setNotices(noticeRes?.data?.items ?? []);
      setEvents(Array.isArray(eventRes?.data) ? eventRes.data : []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const lead = posts[0];
  const secondary = posts.slice(1, 1 + SECONDARY_COUNT);
  const indexRows = posts.slice(1 + SECONDARY_COUNT, 1 + SECONDARY_COUNT + LIST_ROWS);

  const nextEvent = useMemo(
    () => events.find((event) => event.kind === 'exam_week' || event.kind === 'deadline'),
    [events]
  );

  return (
    <div className="home" ref={revealRef}>
      {/* Nameplate. The campus photograph is a slim band behind it rather than
          a full-height hero — this is a front page, not a landing page. */}
      <header className="masthead">
        <div className="masthead__photo" aria-hidden="true">
          <div className="masthead__photo-inner" />
        </div>
        <div className="masthead__scrim" aria-hidden="true" />

        <div className="masthead__inner">
          <p className="masthead__kicker">Community Portal · Students &amp; Staff</p>
          <h1 className="masthead__nameplate">University of South Asia</h1>
          <p className="masthead__tagline">
            Notices, exam routines, class notes and campus writing — published by the people who
            study and work here.
          </p>
        </div>

        <dl className="masthead__facts">
          <div>
            <dt>Posts</dt>
            <dd>{status === 'ready' ? total : '—'}</dd>
          </div>
          <div>
            <dt>Notices</dt>
            <dd>{status === 'ready' ? notices.length : '—'}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>{categories.length || '—'}</dd>
          </div>
          <div>
            <dt>Today</dt>
            <dd>{moment().format(DATE)}</dd>
          </div>
        </dl>
      </header>

      {/* Section strip, the way a paper lists its sections under the masthead. */}
      <nav className="sections" aria-label="Categories">
        <Link to="/posts">All</Link>
        {categories.map((category) => (
          <Link key={category.id} to={`/posts?cat=${category.code}`}>
            {category.name}
            <span>{category.postCount ?? 0}</span>
          </Link>
        ))}
      </nav>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading the front page…" rows={5} />}

      {status === 'ready' && (
        <>
          <div className="front">
            <div className="front__lead">
              {lead ? (
                <article className="lead" data-reveal>
                  <Link
                    to={`/post/${lead.id}`}
                    className="lead__media"
                    style={{ '--hue': lead.categoryHue ?? 220 }}
                  >
                    <Cover post={lead} />
                  </Link>

                  <div className="lead__body">
                    <p className="kicker">
                      <Link to={`/posts?cat=${lead.categoryCode}`}>{lead.categoryName}</Link>
                    </p>
                    <h2>
                      <Link to={`/post/${lead.id}`}>{lead.title}</Link>
                    </h2>
                    <p className="lead__standfirst">{excerpt(lead.desc, 230)}</p>

                    <div className="byline">
                      <span className="byline__avatar">
                        {lead.userImg ? (
                          <img src={mediaUrl(lead.userImg)} alt="" />
                        ) : (
                          initials(lead.username)
                        )}
                      </span>
                      <span>{lead.username}</span>
                      <span className="byline__sep">·</span>
                      <time dateTime={lead.date}>{moment(lead.date).format(DATE)}</time>
                    </div>

                    <PostMetrics post={lead} />
                  </div>
                </article>
              ) : (
                <p className="panel__empty">Nothing has been published yet.</p>
              )}
            </div>

            <aside className="front__side">
              <section className="panel" data-reveal>
                <header className="panel__head">
                  <h3>Notice board</h3>
                  <Link to="/notices">All notices →</Link>
                </header>

                {notices.length === 0 ? (
                  <p className="panel__empty">No notices published.</p>
                ) : (
                  <ul className="lines">
                    {notices.slice(0, 7).map((notice) => (
                      <li key={notice.id}>
                        <time>{moment(notice.publishAt).format(DATE)}</time>
                        <Link to={`/notices/${notice.id}`}>
                          {notice.priority !== 'normal' && (
                            <span className={`lines__flag lines__flag--${notice.priority}`}>
                              {notice.priority}
                            </span>
                          )}
                          {notice.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link to="/notices" className="panel__more">
                  View the notice board →
                </Link>
              </section>

              <section className="panel panel--week" data-reveal>
                <header className="panel__head">
                  <h3>Coming up</h3>
                  <Link to="/calendar">Calendar →</Link>
                </header>

                {nextEvent && (
                  <p className="week__next">
                    {nextEvent.title} —{' '}
                    <strong>{Math.max(0, moment(nextEvent.startsAt).diff(moment(), 'days'))}</strong>{' '}
                    days away
                  </p>
                )}

                {events.length === 0 ? (
                  <p className="panel__empty">Nothing scheduled.</p>
                ) : (
                  <ul className="lines lines--dates">
                    {events.map((event) => (
                      <li key={event.id}>
                        <time>{moment(event.startsAt).format(DATE)}</time>
                        <span>
                          {event.title}
                          {event.location && <em className="lines__where">{event.location}</em>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          </div>

          {secondary.length > 0 && (
            <section className="secondaries" data-reveal>
              {secondary.map((post) => (
                <article className="mini" key={post.id}>
                  <Link
                    to={`/post/${post.id}`}
                    className="mini__media"
                    style={{ '--hue': post.categoryHue ?? 220 }}
                  >
                    <Cover post={post} />
                  </Link>

                  <div className="mini__body">
                    <p className="kicker">
                      <Link to={`/posts?cat=${post.categoryCode}`}>{post.categoryName}</Link>
                    </p>
                    <h3>
                      <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="mini__meta">
                      {post.username} · {moment(post.date).format(DATE)}
                    </p>
                    <PostMetrics post={post} showViews={false} />
                  </div>
                </article>
              ))}
            </section>
          )}

          {indexRows.length > 0 && (
            <section className="board" data-reveal>
              <div className="board__title">
                <h2>Latest posts</h2>
                <span>{total} published</span>
              </div>

              <div className="board__scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="board__sl">Sl.</th>
                      <th>Subject</th>
                      <th className="metrics-col">Rating</th>
                      <th className="metrics-col">Comments</th>
                      <th className="board__date">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {indexRows.map((post, index) => (
                      <tr key={post.id}>
                        <td className="board__sl">{index + 1}</td>
                        <td className="board__subject">
                          <Link to={`/post/${post.id}`}>{post.title}</Link>
                          <span className="board__meta">
                            {post.categoryName} · by {post.username} · {excerpt(post.desc, 80)}
                          </span>
                        </td>
                        <td className="metrics-col">
                          {post.ratingCount ? (
                            <span className="metrics__item metrics__rating">
                              <span className="metrics__star" aria-hidden="true">
                                ★
                              </span>
                              <strong>{Number(post.ratingAvg).toFixed(1)}</strong>
                              <span className="metrics__sub">({post.ratingCount})</span>
                            </span>
                          ) : (
                            <span className="metrics__none">—</span>
                          )}
                        </td>
                        <td className="metrics-col">{post.commentCount}</td>
                        <td className="board__date">
                          {moment(post.date).format(DATE)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="home__more">
            <Link to="/posts" className="btn btn--ghost">
              View all {total} posts
            </Link>
            {!currentUser && (
              <Link to="/register" className="btn btn--primary">
                Join the community
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
