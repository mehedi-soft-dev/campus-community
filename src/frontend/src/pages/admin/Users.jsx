import { useState } from 'react';
import moment from 'moment';
import { api, errorMessage } from '../../api/axios.js';
import Loading from '../../components/Loading.jsx';
import Pager from '../../components/Pager.jsx';
import { useAuth } from '../../context/authContext.jsx';
import { Action, AdminTable, Feedback, Panel, RowActions, useResource } from './shared.jsx';

const STATUS_FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'all', label: 'All' },
];

const ROLES = ['user', 'moderator', 'admin'];

export default function Users() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [statusFilter, setStatusFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busyId, setBusyId] = useState(null);

  const { items, total, totalPages, page, setPage, status, reload } = useResource('/admin/users', {
    status: statusFilter === 'all' ? undefined : statusFilter,
    q: search || undefined,
  });

  const patch = async (user, body, message) => {
    setBusyId(user.id);
    setError('');
    setOk('');
    try {
      await api.patch(`/admin/users/${user.id}`, body);
      setOk(message);
      await reload();
    } catch (err) {
      setError(errorMessage(err, 'Could not update that account.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin__grid">
      <Panel
        title="Accounts"
        note={
          isAdmin
            ? 'Approving sets a pending account to active so it can sign in. Only admins can change roles or status.'
            : 'Moderators can review this queue. Approving and changing roles needs an administrator.'
        }
      >
        <div className="hub__filters admin__filters">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`chip ${statusFilter === option.value ? 'chip--active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}

          <span className="spacer" />

          <form
            className="hub__search"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(query.trim());
            }}
            role="search"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search username or email…"
            />
          </form>
        </div>

        {status === 'loading' && <Loading label="Loading accounts…" rows={3} />}
      </Panel>

      <Feedback error={error} ok={ok} onDismiss={() => { setError(''); setOk(''); }} />

      {status === 'ready' && (
        <Panel title={`${total} account${total === 1 ? '' : 's'}`}>
          {items.length === 0 ? (
            <p className="admin-empty">Nothing matches this filter.</p>
          ) : (
            <AdminTable
              columns={[
                { label: 'Username' },
                { label: 'Email' },
                { label: 'Role' },
                { label: 'Status' },
                { label: 'Joined / dept' },
                { label: '' },
              ]}
            >
              {items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="admin-table__title">{user.username}</span>
                    {user.fullName && <span className="admin-table__sub">{user.fullName}</span>}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`admin-pill ${
                        user.role === 'admin' ? 'admin-pill--warn' : user.role === 'moderator' ? '' : 'admin-pill--muted'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-pill ${
                        user.status === 'active'
                          ? 'admin-pill--ok'
                          : user.status === 'pending'
                            ? ''
                            : 'admin-pill--warn'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>{user.departmentName ?? '—'}</td>
                  <td>
                    {isAdmin ? (
                      <RowActions>
                        {user.status !== 'active' && (
                          <Action
                            onClick={() =>
                              patch(user, { status: 'active' }, `${user.username} can now sign in.`)
                            }
                          >
                            Approve
                          </Action>
                        )}
                        {user.status === 'active' && (
                          <Action
                            danger
                            onClick={() =>
                              patch(user, { status: 'suspended' }, `${user.username} was suspended.`)
                            }
                          >
                            Suspend
                          </Action>
                        )}
                        <select
                          className="admin-role-select"
                          value={user.role}
                          disabled={busyId === user.id || user.id === currentUser.id}
                          onChange={(event) =>
                            patch(
                              user,
                              { role: event.target.value },
                              `${user.username} is now ${event.target.value}.`
                            )
                          }
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </RowActions>
                    ) : (
                      <span className="admin-table__sub">admin only</span>
                    )}
                  </td>
                </tr>
              ))}
            </AdminTable>
          )}

          <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </Panel>
      )}
    </div>
  );
}
