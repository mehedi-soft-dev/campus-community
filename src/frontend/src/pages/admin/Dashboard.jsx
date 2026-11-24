import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/axios.js';
import Loading from '../../components/Loading.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(errorMessage(err, 'Could not load the summary.')));
  }, []);

  if (error) return <div className="banner banner--error">{error}</div>;
  if (!stats) return <Loading label="Loading the dashboard…" rows={2} />;

  const tiles = [
    { label: 'Users', value: stats.users.total },
    { label: 'Awaiting approval', value: stats.users.pending, flag: stats.users.pending > 0 },
    { label: 'Suspended', value: stats.users.suspended, flag: stats.users.suspended > 0 },
    { label: 'Moderators', value: stats.users.moderators },
    { label: 'Posts', value: stats.posts },
    { label: 'Notices', value: stats.notices },
    { label: 'Events', value: stats.events },
    { label: 'Materials', value: stats.materials },
    { label: 'Comments', value: stats.comments },
    { label: 'Ratings', value: stats.ratings },
  ];

  return (
    <div className="admin__grid">
      <dl className="admin__stats">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`admin__stat ${tile.flag ? 'admin__stat--flag' : ''}`}
          >
            <dt>{tile.label}</dt>
            <dd>{tile.value}</dd>
          </div>
        ))}
      </dl>

      {stats.users.pending > 0 && (
        <p className="admin-note">
          <Link to="/admin/users">
            {stats.users.pending} account{stats.users.pending === 1 ? '' : 's'} waiting for approval →
          </Link>
        </p>
      )}
    </div>
  );
}
