import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage, fieldErrors } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import Pager from '../components/Pager.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/authContext.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useReveal } from '../hooks/useReveal.js';

const PAGE_SIZE = 10;

const FILTERS = [
  { value: 'all', label: 'All questions' },
  { value: 'unanswered', label: 'Needs an answer' },
  { value: 'answered', label: 'Answered' },
  { value: 'mine', label: 'My questions' },
];

export default function Questions() {
  const { currentUser } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get('filter') ?? 'all';
  const q = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, unanswered: 0, answered: 0 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  usePageTitle('Questions & answers');

  // The form is closed on arrival: this page's job is to show the questions
  // that already exist, and the button reveals the form when you want it.
  const [askOpen, setAskOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const revealRef = useReveal([status, items, page]);

  // Changing a filter or a search term starts a new result set, so the page
  // number has to go back to 1 — otherwise you land on page 4 of 1.
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    if (filter === 'mine' && !currentUser) {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      setError('Log in to see the questions you have asked.');
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const [list, statsRes] = await Promise.all([
        api.get('/questions', {
          params: { filter, q: q || undefined, page, pageSize: PAGE_SIZE },
        }),
        api.get('/questions/stats'),
      ]);
      setItems(list.data.items ?? []);
      setTotal(list.data.total ?? 0);
      setTotalPages(list.data.totalPages ?? 1);
      setStats(statsRes.data);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err, 'Could not load questions.'));
      setStatus('error');
    }
  }, [filter, q, page, currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const submitQuestion = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (title.trim().length < 10) {
      nextErrors.title = 'Describe the question in at least 10 characters.';
    }
    if (body.trim().length < 10) {
      nextErrors.body = 'Add a bit of detail so people can help.';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    setErrors({});

    try {
      const { data } = await api.post('/questions', {
        title: title.trim(),
        body: body.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
      });
      navigate(`/questions/${data.id}`);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setError(errorMessage(err, 'Could not post your question.'));
      setBusy(false);
    }
  };

  return (
    <div className="hub" ref={revealRef}>
      <header className="hub__head" data-reveal>
        <p className="eyebrow">Community</p>
        <h1>Questions &amp; answers</h1>
        <p className="hub__lede">
          Ask anything about courses, procedures or campus life. Anyone can answer, and the person
          who asked marks the answer that worked.
        </p>
      </header>

      <div className="qa__stats" data-reveal>
        <span>
          <strong>{stats.total}</strong> asked
        </span>
        <span className={stats.unanswered > 0 ? 'qa__stats-open' : undefined}>
          <strong>{stats.unanswered}</strong> waiting for an answer
        </span>
        <span>
          <strong>{stats.answered}</strong> answered
        </span>

        {currentUser && (
          <span className="qa__stats-cta">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setAskOpen((open) => !open)}
              aria-expanded={askOpen}
            >
              {askOpen ? 'Close' : 'Ask a question'}
            </button>
          </span>
        )}
      </div>

      {askOpen && currentUser && (
        <section className="qa__ask is-open" data-reveal>
          <form className="qa__ask-form" onSubmit={submitQuestion} noValidate>
            {error && <div className="banner banner--error">{error}</div>}

            <label className="field">
              <span>Your question</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. How do I register for a midterm retake?"
                maxLength={200}
                autoFocus
              />
              {errors.title && <em className="field__error">{errors.title}</em>}
            </label>

            <label className="field">
              <span>Details</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What have you already tried? Include the course code, department or dates if they matter."
                rows={5}
                maxLength={10000}
              />
              <em className="field__hint">{body.length}/10000</em>
              {errors.body && <em className="field__error">{errors.body}</em>}
            </label>

            <div className="qa__ask-row">
              <label className="field">
                <span>Category (optional)</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? 'Posting…' : 'Post question'}
              </button>
            </div>
          </form>
        </section>
      )}

      {!currentUser && (
        <p className="qa__signin" data-reveal>
          <Link to="/login">Log in</Link> to ask a question or answer one.
        </p>
      )}

      <div className="hub__filters" data-reveal>
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip ${filter === option.value ? 'chip--active' : ''}`}
            onClick={() => updateParam('filter', option.value === 'all' ? '' : option.value)}
          >
            {option.label}
            {option.value === 'unanswered' && stats.unanswered > 0 ? ` (${stats.unanswered})` : ''}
          </button>
        ))}

        <span className="spacer" />

        <form
          className="hub__search"
          onSubmit={(event) => {
            event.preventDefault();
            updateParam('q', new FormData(event.currentTarget).get('q'));
          }}
          role="search"
        >
          <input type="search" name="q" defaultValue={q} placeholder="Search questions…" />
        </form>
      </div>

      {status === 'loading' && <Loading label="Loading questions…" rows={4} />}
      {error && status !== 'ready' && <div className="banner banner--error">{error}</div>}

      {status === 'ready' && items.length === 0 && (
        <div className="empty-state">
          <h2>No questions here</h2>
          <p>
            {filter === 'mine'
              ? 'You have not asked anything yet.'
              : filter === 'unanswered'
                ? 'Everything has an answer. Nice.'
                : 'Nothing matches this filter yet — be the first to ask.'}
          </p>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <>
          <div className="board fade-swap">
            <div className="board__title">
              <h2>Questions</h2>
              <span>
                {total} question{total === 1 ? '' : 's'}
                {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ''}
              </span>
            </div>

            <div className="board__scroll">
              <table>
                <thead>
                  <tr>
                    <th className="board__sl">Sl.</th>
                    <th>Question</th>
                    <th className="board__cat">Category</th>
                    <th className="qa__answers-col">Answers</th>
                    <th className="board__date">Asked</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={item.answerCount === 0 ? 'qa__row--open' : undefined}
                    >
                      <td className="board__sl">{(page - 1) * PAGE_SIZE + index + 1}</td>

                      <td className="board__subject">
                        <Link to={`/questions/${item.id}`}>{item.title}</Link>
                        {item.solved && (
                          <span className="board__marker qa__marker--solved">Solved</span>
                        )}
                        {item.answerCount === 0 && (
                          <span className="board__marker">Needs an answer</span>
                        )}
                        <span className="board__meta">
                          asked by {item.author}
                          {item.categoryName ? ` · ${item.categoryName}` : ''}
                        </span>
                      </td>

                      <td className="board__cat">{item.categoryName ?? '—'}</td>
                      <td className="qa__count">{item.answerCount}</td>
                      <td className="board__date">
                        {moment(item.createdAt).format('DD/MM/YYYY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pager
            page={page}
            totalPages={totalPages}
            onChange={(next) => updateParam('page', next === 1 ? '' : String(next))}
            label="Question pages"
          />
        </>
      )}
    </div>
  );
}
