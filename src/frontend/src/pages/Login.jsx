import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/authContext.jsx';
import { errorMessage, fieldErrors } from '../api/axios.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Log in');

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage('');

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      setMessage(Object.keys(fields).length ? '' : errorMessage(err, 'Could not log in.'));
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Member sign in"
      subtitle="Sign in to publish, rate and take part in discussions."
      footer={
        <p className="auth__switch">
          New to the portal? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {message && <div className="banner banner--error">{message}</div>}

        <label className="field">
          <span>Username</span>
          <input
            value={form.username}
            onChange={change('username')}
            autoComplete="username"
            autoFocus
          />
          {errors.username && <em className="field__error">{errors.username}</em>}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={change('password')}
            autoComplete="current-password"
          />
          {errors.password && <em className="field__error">{errors.password}</em>}
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth__hint">
          Seeded demo account — <code>demo</code> / <code>password123</code>
        </p>
      </form>
    </AuthLayout>
  );
}
