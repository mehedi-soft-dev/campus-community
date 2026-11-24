import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/authContext.jsx';
import { errorMessage, fieldErrors } from '../api/axios.js';

const EMPTY = { username: '', email: '', password: '', confirm: '' };

export default function Register() {
  const { register } = useAuth();

  usePageTitle('Create an account');

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const change = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    // The confirm field only exists in the browser, so it is checked here rather
    // than in the API schema.
    if (form.password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match.' });
      setMessage('');
      return;
    }

    setBusy(true);
    setErrors({});
    setMessage('');

    try {
      await register({ username: form.username, email: form.email, password: form.password });
      setDone(true);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      setMessage(Object.keys(fields).length ? '' : errorMessage(err, 'Could not create the account.'));
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthLayout
        title="Awaiting approval"
        subtitle="Your account has been created."
        footer={
          <p className="auth__switch">
            Already approved? <Link to="/login">Sign in</Link>
          </p>
        }
      >
        <div className="auth__done">
          <p>
            <span className="badge badge--pending">Pending review</span>
          </p>
          <p>
            A moderator will review <strong>{form.username}</strong> before it can sign in. You
            will be able to post, rate and comment once approved.
          </p>
          <Link className="btn btn--primary btn--block" to="/notices">
            Read the notice board while you wait
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the University of South Asia community portal."
      footer={
        <p className="auth__switch">
          Already a member? <Link to="/login">Sign in</Link>
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
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={change('email')}
            autoComplete="email"
          />
          {errors.email && <em className="field__error">{errors.email}</em>}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={change('password')}
            autoComplete="new-password"
          />
          <em className="field__hint">At least 8 characters.</em>
          {errors.password && <em className="field__error">{errors.password}</em>}
        </label>

        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            value={form.confirm}
            onChange={change('confirm')}
            autoComplete="new-password"
          />
          {errors.confirm && <em className="field__error">{errors.confirm}</em>}
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
