import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import Pager from '../components/Pager.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AdminLink from '../components/AdminLink.jsx';
import { useReveal } from '../hooks/useReveal.js';

const KIND_LABELS = {
  event: 'Event',
  holiday: 'Holiday',
  exam_week: 'Exam week',
  deadline: 'Deadline',
  registration: 'Registration',
  result: 'Result',
};

// The API clamps pageSize at 50, so paging is the only way past it.
const PAGE_SIZE = 30;

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle('Calendar & events');

  const revealRef = useReveal([status, events]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    api
      .get('/events', { params: { page, pageSize: PAGE_SIZE } })
      .then(({ data }) => {
        if (cancelled) return;
        setEvents(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err, 'Could not load the calendar.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // Group by month so the page reads as an academic calendar.
  const months = useMemo(() => {
    const groups = new Map();
    for (const event of events) {
      const key = moment(event.startsAt).format('MMMM YYYY');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(event);
    }
    return [...groups.entries()];
  }, [events]);

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Academic calendar</p>
        <h1>Calendar &amp; events</h1>
        <AdminLink to="/admin/events">Add a calendar entry</AdminLink>
        <p className="hub__lede">
          Term dates, holidays, exam weeks and campus events published by university staff.
        </p>
      </header>

      {error && <div className="banner banner--error">{error}</div>}
      {status === 'loading' && <Loading label="Loading calendar…" rows={4} />}

      {status === 'ready' && events.length === 0 && (
        <div className="empty-state">
          <h2>Nothing scheduled</h2>
          <p>Events and academic dates appear here once staff add them.</p>
        </div>
      )}

      {months.map(([month, monthEvents]) => (
        <section className="calendar-month" key={month}>
          <div className="board fade-swap">
            <div className="board__title">
              <h2>{month}</h2>
              <span>
                {monthEvents.length} entr{monthEvents.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            <div className="board__scroll">
              <table>
                <thead>
                  <tr>
                    <th className="board__sl">Sl.</th>
                    <th>Event</th>
                    <th className="board__date">Date</th>
                    <th className="board__file">Type</th>
                  </tr>
                </thead>

                <tbody>
                  {monthEvents.map((event, index) => {
                    const when = event.allDay
                      ? moment(event.startsAt).format('DD/MM/YYYY')
                      : moment(event.startsAt).format('DD/MM/YYYY · HH:mm');

                    return (
                      <tr key={event.id}>
                        <td className="board__sl">{index + 1}</td>

                        <td className="board__subject">
                          {event.title}
                          <span className="board__meta">
                            {[event.location, event.departmentCode]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </span>
                        </td>

                        <td className="board__date">{when}</td>

                        <td className="board__file">
                          <span className={`badge badge--kind-${event.kind}`}>
                            {KIND_LABELS[event.kind] ?? event.kind}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      <Pager page={page} totalPages={totalPages} onChange={setPage} label="Calendar pages" />
    </div>
  );
}
