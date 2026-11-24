import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Posts from './pages/Posts.jsx';
import Questions from './pages/Questions.jsx';
import QuestionDetail from './pages/QuestionDetail.jsx';
import Single from './pages/Single.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import Notices from './pages/Notices.jsx';
import NoticeDetail from './pages/NoticeDetail.jsx';
import Routine from './pages/Routine.jsx';
import Calendar from './pages/Calendar.jsx';
import Materials from './pages/Materials.jsx';
import { useAuth } from './context/authContext.jsx';

// Split out the two heavy, rarely-visited areas. /write pulls in the whole quill
// editor (the largest chunk in the app) and /admin carries eight tabs — neither
// should be downloaded by someone who only reads the front page.
const Write = lazy(() => import('./pages/Write.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function RouteFallback() {
  return <div className="page-status">Loading…</div>;
}

function Layout() {
  const location = useLocation();

  return (
    <div className="app">
      {/* Scrolls to the top on navigation and restores the previous position on
          back/forward. Without this, clicking a nav link keeps the old scroll
          offset, so a new page can open halfway down. */}
      <ScrollRestoration />
      <Navbar />
      <main className="app__main">
        {/* Keyed on the path so the enter animation replays on navigation, but
            not on every query-string change (filters stay instant). */}
        <div className="page-enter" key={location.pathname}>
          {/* One boundary for every lazily-loaded route below. */}
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function RequireAuth({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="page-status">Checking your session…</div>;
  if (!currentUser) return <Navigate to="/login" replace />;

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts', element: <Posts /> },
      { path: 'questions', element: <Questions /> },
      { path: 'questions/:id', element: <QuestionDetail /> },
      { path: 'admin', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'admin/:tab', element: <Admin /> },
      { path: 'post/:id', element: <Single /> },
      { path: 'notices', element: <Notices /> },
      { path: 'notices/:id', element: <NoticeDetail /> },
      { path: 'routine', element: <Routine /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'materials', element: <Materials /> },
      {
        path: 'write',
        element: (
          <RequireAuth>
            <Write />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
