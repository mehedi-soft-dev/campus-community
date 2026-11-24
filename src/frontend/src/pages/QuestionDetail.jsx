import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import Loading from '../components/Loading.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/authContext.jsx';
import { initials, mediaUrl } from '../utils/media.js';

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [question, setQuestion] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  usePageTitle(question?.title);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const { data } = await api.get(`/questions/${id}`);
      setQuestion(data);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err, 'Could not load that question.'));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isAsker = Boolean(currentUser && question) && question.askedById === currentUser.id;
  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  const canModerate = Boolean(currentUser) && (isAsker || isStaff);

  const submitAnswer = async (event) => {
    event.preventDefault();
    if (body.trim().length < 2 || busy) return;

    setBusy(true);
    setError('');
    try {
      await api.post(`/questions/${id}/answers`, { body: body.trim() });
      setBody('');
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not post your answer.'));
    } finally {
      setBusy(false);
    }
  };

  const accept = async (answerId) => {
    try {
      await api.patch(`/questions/${id}/accept`, { answerId });
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not update the accepted answer.'));
    }
  };

  const removeQuestion = async () => {
    if (!window.confirm('Delete this question and its answers?')) return;
    try {
      await api.delete(`/questions/${id}`);
      navigate('/questions');
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the question.'));
    }
  };

  const removeAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      await api.delete(`/questions/${id}/answers/${answerId}`);
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the answer.'));
    }
  };

  if (status !== 'ready') {
    return (
      <div className="hub">
        {status === 'loading' ? (
          <Loading label="Loading question…" rows={4} />
        ) : (
          <div className="empty-state">
            <h2>{error}</h2>
            <Link className="btn btn--primary" to="/questions">
              Back to all questions
            </Link>
          </div>
        )}
      </div>
    );
  }

  const answers = question.answers ?? [];

  return (
    <div className="hub">
      <Link to="/questions" className="qa__back">
        ← All questions
      </Link>

      {error && <div className="banner banner--error">{error}</div>}

      <article className="qa__question fade-swap">
        <header className="qa__question-head">
          <div>
            {question.categoryName && (
              <p className="kicker">
                <Link to={`/questions?category=${question.categoryCode}`}>
                  {question.categoryName}
                </Link>
              </p>
            )}
            <h1>{question.title}</h1>
            <p className="qa__meta">
              Asked by <strong>{question.author}</strong> ·{' '}
              {moment(question.createdAt).format('DD/MM/YYYY')} · {question.views} view
              {question.views === 1 ? '' : 's'} · {answers.length} answer
              {answers.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="qa__question-side">
            {question.solved && <span className="qa__solved">Solved</span>}
            {!question.solved && answers.length === 0 && (
              <span className="qa__open">Needs an answer</span>
            )}
            {canModerate && (
              <button type="button" className="comment__action" onClick={removeQuestion}>
                Delete
              </button>
            )}
          </div>
        </header>

        <p className="qa__body">{question.body}</p>
      </article>

      <section className="qa__answers">
        <h2>
          {answers.length === 0
            ? 'No answers yet'
            : `${answers.length} answer${answers.length === 1 ? '' : 's'}`}
        </h2>

        {answers.length === 0 && (
          <p className="qa__prompt">
            Nobody has answered this yet. If you know the process, this is the moment to help.
          </p>
        )}

        {answers.map((answer) => (
          <article
            className={`answer ${answer.id === question.acceptedAnswerId ? 'answer--accepted' : ''}`}
            key={answer.id}
          >
            {answer.id === question.acceptedAnswerId && (
              <p className="answer__accepted">Accepted answer</p>
            )}

            <header className="answer__head">
              <span className="comment__avatar">
                {answer.authorImg ? <img src={mediaUrl(answer.authorImg)} alt="" /> : initials(answer.username)}
              </span>
              <strong>{answer.username}</strong>
              {answer.authorRole && answer.authorRole !== 'user' && (
                <span className={`badge badge--${answer.authorRole === 'admin' ? 'urgent' : 'course'}`}>
                  {answer.authorRole}
                </span>
              )}
              <time>{moment(answer.createdAt).format('DD/MM/YYYY')}</time>

              <span className="comment__spacer" />

              {canModerate && (
                <>
                  <button type="button" className="comment__action" onClick={() => accept(answer.id)}>
                    {answer.id === question.acceptedAnswerId ? 'Unmark' : 'Mark as answer'}
                  </button>
                  <button
                    type="button"
                    className="comment__action"
                    onClick={() => removeAnswer(answer.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </header>

            <p className="answer__body">{answer.body}</p>
          </article>
        ))}

        {currentUser ? (
          <form className="qa__answer-form" onSubmit={submitAnswer}>
            <label className="field">
              <span>Your answer</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Explain the process, add the link, or say what worked for you."
                rows={4}
                maxLength={10000}
              />
            </label>
            <div className="qa__answer-actions">
              <span className="comment__count">{body.length}/10000</span>
              <button type="submit" className="btn btn--primary btn--sm" disabled={busy || body.trim().length < 2}>
                {busy ? 'Posting…' : 'Post answer'}
              </button>
            </div>
          </form>
        ) : (
          <p className="qa__signin">
            <Link to="/login">Log in</Link> to answer this question.
          </p>
        )}
      </section>
    </div>
  );
}
