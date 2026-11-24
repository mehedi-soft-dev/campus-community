import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth__aside">
        <span className="auth__brand">
          <img src="/uni_logo.png" alt="University of South Asia" />
        </span>

        <div className="auth__pitch">
          <h1>Campus knowledge, kept in one place.</h1>
          <p>
            Class notes, project write-ups, notices and everything the campus is talking
            about — published and discussed by students and faculty.
          </p>
          <ul className="auth__points">
            <li>Read every post and category</li>
            <li>Publish, rate and comment as a member</li>
            <li>Your department and batch on your profile</li>
          </ul>
        </div>

        <Link to="/" className="auth__back">
          ← Back to the community
        </Link>
      </section>

      <section className="auth__panel">
        <div className="auth__card">
          {/* The desktop aside carries the "back" link; on a phone the aside is
              hidden, which used to strand the user on this page with no way
              out except the Register/Login switch. */}
          <Link to="/" className="auth__back-mobile">
            ← Back to the community
          </Link>

          <header>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </header>
          {children}
          {footer}
        </div>
      </section>
    </div>
  );
}
