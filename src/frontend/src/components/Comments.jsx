import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { api, errorMessage } from '../api/axios.js';
import { useAuth } from '../context/authContext.jsx';
import { initials, mediaUrl } from '../utils/media.js';

export default function Comments({ postId }) {
  const { currentUser } = useAuth();

  const [sort, setSort] = useState('new');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const { data } = await api.get(`/posts/${postId}/comments`, { params: { sort } });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err, 'Could not load comments.'));
      setStatus('error');
    }
  }, [postId, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const patchComment = (id, patch) => {
    setItems((prev) =>
      prev.map((root) => {
        if (root.id === id) return { ...root, ...patch };
        return {
          ...root,
          replies: (root.replies ?? []).map((reply) =>
            reply.id === id ? { ...reply, ...patch } : reply
          ),
        };
      })
    );
  };

  const submit = async (event, parentId) => {
    event.preventDefault();
    const text = (parentId ? replyBody : body).trim();
    if (!text || busy) return;

    setBusy(true);
    setError('');
    try {
      await api.post(`/posts/${postId}/comments`, {
        body: text,
        parentId: parentId ?? undefined,
      });
      setBody('');
      setReplyBody('');
      setReplyTo(null);
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not post your comment.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      if (editId === id) setEditId(null);
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the comment.'));
    }
  };

  // Editing is open to the author and to staff; the API enforces the same rule.
  const startEdit = (comment) => {
    setReplyTo(null);
    setEditId(comment.id);
    setEditBody(comment.body);
  };

  const saveEdit = async (event, id) => {
    event.preventDefault();
    const text = editBody.trim();
    if (!text || busy) return;

    setBusy(true);
    setError('');
    try {
      const { data } = await api.put(`/comments/${id}`, { body: text });
      patchComment(id, { body: data.body });
      setEditId(null);
      setEditBody('');
    } catch (err) {
      setError(errorMessage(err, 'Could not save your edit.'));
    } finally {
      setBusy(false);
    }
  };

  const vote = async (comment, value) => {
    // Clicking the same direction again clears the vote.
    const next = comment.myVote === value ? 0 : value;
    try {
      const { data } = await api.put(`/comments/${comment.id}/vote`, { value: next });
      patchComment(comment.id, { score: data.score, myVote: data.myVote });
    } catch (err) {
      setError(errorMessage(err, 'Could not save your vote.'));
    }
  };

  const renderComment = (comment, isReply = false) => {
    const own = Boolean(currentUser) && comment.userId === currentUser.id;
    const staff = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
    const avatar = mediaUrl(comment.userImg);

    return (
      <article className={`comment ${isReply ? 'comment--reply' : ''}`} key={comment.id}>
        <div className="comment__votes">
          <button
            type="button"
            onClick={() => vote(comment, 1)}
            disabled={own || !currentUser}
            className={comment.myVote === 1 ? 'is-on' : ''}
            aria-label="Upvote"
          >
            ▲
          </button>
          <span>{comment.score ?? 0}</span>
          <button
            type="button"
            onClick={() => vote(comment, -1)}
            disabled={own || !currentUser}
            className={comment.myVote === -1 ? 'is-on' : ''}
            aria-label="Downvote"
          >
            ▼
          </button>
        </div>

        <div className="comment__body">
          <header className="comment__head">
            <span className="comment__avatar">
              {avatar ? <img src={avatar} alt="" /> : initials(comment.username)}
            </span>
            <strong>{comment.username}</strong>
            {comment.authorRole !== 'user' && (
              <span className={`badge badge--${comment.authorRole === 'admin' ? 'urgent' : 'course'}`}>
                {comment.authorRole}
              </span>
            )}
            <time>{moment(comment.createdAt).fromNow()}</time>

            <span className="comment__spacer" />
            {currentUser && !isReply && (
              <button
                type="button"
                className="comment__action"
                onClick={() => {
                  setReplyTo(replyTo === comment.id ? null : comment.id);
                  setReplyBody('');
                }}
              >
                Reply
              </button>
            )}
            {(own || staff) && (
              <>
                <button
                  type="button"
                  className="comment__action"
                  onClick={() => startEdit(comment)}
                >
                  Edit
                </button>
                <button type="button" className="comment__action" onClick={() => remove(comment.id)}>
                  Delete
                </button>
              </>
            )}
          </header>

          {editId === comment.id ? (
            <form
              className="comment__form comment__form--reply"
              onSubmit={(event) => saveEdit(event, comment.id)}
            >
              <textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                rows={3}
                maxLength={2000}
                autoFocus
              />
              <div className="comment__form-actions">
                <span className="comment__count">{editBody.length}/2000</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={busy || !editBody.trim()}
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <p className="comment__text">{comment.body}</p>
          )}

          {replyTo === comment.id && (
            <form className="comment__form comment__form--reply" onSubmit={(e) => submit(e, comment.id)}>
              <textarea
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder={`Reply to ${comment.username}…`}
                rows={2}
                maxLength={2000}
                autoFocus
              />
              <div className="comment__form-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReplyTo(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
                  Reply
                </button>
              </div>
            </form>
          )}

          {!isReply && comment.replies?.length > 0 && (
            <div className="comment__replies">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="comments">
      <header className="comments__head">
        <h2>
          {total} comment{total === 1 ? '' : 's'}
        </h2>
        <div className="toggle">
          <button type="button" className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}>
            Newest
          </button>
          <button type="button" className={sort === 'top' ? 'on' : ''} onClick={() => setSort('top')}>
            Top
          </button>
        </div>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      {currentUser ? (
        <form className="comment__form" onSubmit={(e) => submit(e)}>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add to the discussion…"
            rows={3}
            maxLength={2000}
          />
          <div className="comment__form-actions">
            <span className="comment__count">{body.length}/2000</span>
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy || !body.trim()}>
              {busy ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="comments__signin">
          <Link to="/login">Log in</Link> to join the discussion.
        </p>
      )}

      {status === 'loading' && <p className="hub__note">Loading comments…</p>}

      {status === 'ready' && items.length === 0 && (
        <p className="comments__empty">No comments yet — be the first.</p>
      )}

      <div className="comment-list">{items.map((comment) => renderComment(comment))}</div>
    </section>
  );
}
