
import { useCallback, useEffect, useState } from 'react';
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import { api, authToken } from './lib/api.js';

import AuthPage from './pages/AuthPage.jsx';
import PatientPage from './pages/PatientPage.jsx';
import MedicinesPage from './pages/MedicinesPage.jsx';
import CaregiverPage from './pages/CaregiverPage.jsx';
import PatientDetailPage from './pages/PatientDetailPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Defines the shared application layout for authenticated users.
function Shell({ user, onLogout, unread, children }) {
  // Selects navigation links according to the user's role.
  const links =
    user.role === 'patient'
      ? [
        {
          to: '/patient',
          label: 'Overview',
          icon: '◫',
        },
        {
          to: '/medicines',
          label: 'My medicines',
          icon: '✚',
        },
        {
          to: '/report',
          label: 'Adherence report',
          icon: '▥',
        },
      ]
      : [
        {
          to: '/caregiver',
          label: 'My patients',
          icon: '♧',
        },
      ];

  return (
    <div className="app-shell">
      {/* Sidebar containing branding and navigation. */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✚</span>

          <span>
            MedRemind
            <span className="brand-plus">+</span>
            <small>CARE COMPANION</small>
          </span>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav>
          {/* Renders navigation links for the current role. */}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">
                {link.icon}
              </span>

              {link.label}
            </NavLink>
          ))}

          {/* Displays notifications and the unread count. */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">♧</span>

            Notifications

            {unread > 0 && (
              <span className="unread-pill">
                {unread}
              </span>
            )}
          </NavLink>

          {/* Provides access to account settings. */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">⚙</span>
            Settings
          </NavLink>
        </nav>

        {/* Sidebar footer containing support text and user profile. */}
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon">♡</span>

            <strong>
              Care starts with consistency.
            </strong>

            <p>
              Small steps each day can make a difference.
            </p>
          </div>

          <div className="profile-row">
            <div className="avatar">
              {user.name?.slice(0, 1).toUpperCase()}
            </div>

            <div className="profile-meta">
              <strong>{user.name}</strong>

              <span>
                {user.role === 'patient'
                  ? 'Patient account'
                  : 'Caregiver account'}
              </span>
            </div>

            <button
              className="icon-button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area shared by all authenticated pages. */}
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="topbar-label">
              MEDREMIND+ /
            </span>

            <strong>
              {user.role === 'patient'
                ? 'Patient space'
                : 'Caregiver space'}
            </strong>
          </div>

          <div className="topbar-right">
            <span className="status-dot" />

            Connected account

            <div className="avatar small">
              {user.name?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Renders the page selected by the router. */}
        <div className="page-content">
          {children}
        </div>

        <footer className="footer">
          MedRemind+ · Your health routine, supported

          <span>
            For tracking only — not a replacement for
            professional medical advice.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  // Provides programmatic navigation between application routes.
  const navigate = useNavigate();

  // Stores the currently authenticated user.
  const [user, setUser] = useState(null);

  // Tracks whether the initial authentication check has finished.
  const [ready, setReady] = useState(false);

  // Stores the number of unread notifications.
  const [unread, setUnread] = useState(0);

  // Stores the currently visible toast notification.
  const [toast, setToast] = useState(null);

  // Creates a reusable function for displaying toast messages.
  const notify = useCallback(
    (message, type = 'success') =>
      setToast({
        message,
        type,
        key: Date.now(),
      }),
    []
  );

  // Restores the user session using the stored authentication token.
  useEffect(() => {
    if (!authToken.get()) {
      setReady(true);
      return;
    }

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => authToken.clear())
      .finally(() => setReady(true));
  }, []);

  // Fetches the unread notification count after authentication.
  useEffect(() => {
    if (!user) {
      return;
    }

    api('/notifications/unread-count')
      .then((data) => {
        setUnread(Number(data.count || 0));
      })
      .catch(() => { });
  }, [user]);

  // Automatically dismisses toast messages after 3.5 seconds.
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(
      () => setToast(null),
      3500
    );

    // Cleans up the timer when the toast changes or unmounts.
    return () => clearTimeout(timer);
  }, [toast]);

  // Saves the authentication token and redirects after login/signup.
  const handleAuth = (data) => {
    authToken.set(data.token);
    setUser(data.user);
    setUnread(0);

    navigate(
      data.user.role === 'patient'
        ? '/patient'
        : '/caregiver'
    );
  };

  // Clears the local authentication state and returns to the login page.
  const logout = () => {
    authToken.clear();
    setUser(null);
    setUnread(0);

    navigate('/');
  };

  // Displays a loading screen while restoring the user session.
  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="brand-mark">✚</div>

        <strong>
          Preparing your care space…
        </strong>
      </div>
    );
  }

  // Displays the authentication page when no user is authenticated.
  if (!user) {
    return (
      <>
        <AuthPage
          onAuthenticated={handleAuth}
          notify={notify}
        />

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </>
    );
  }

  // Redirects users who try to access routes for another role.
  const protect = (element, role) =>
    role && user.role !== role ? (
      <Navigate
        to={
          user.role === 'patient'
            ? '/patient'
            : '/caregiver'
        }
        replace
      />
    ) : (
      element
    );

  return (
    <Shell
      user={user}
      onLogout={logout}
      unread={unread}
    >
      <Routes>
        {/* Redirects the root URL to the user's home page. */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                user.role === 'patient'
                  ? '/patient'
                  : '/caregiver'
              }
              replace
            />
          }
        />

        {/* Patient-only routes. */}
        <Route
          path="/patient"
          element={protect(
            <PatientPage
              user={user}
              notify={notify}
            />,
            'patient'
          )}
        />

        <Route
          path="/medicines"
          element={protect(
            <MedicinesPage notify={notify} />,
            'patient'
          )}
        />

        {/* Caregiver-only routes. */}
        <Route
          path="/caregiver"
          element={protect(
            <CaregiverPage notify={notify} />,
            'caregiver'
          )}
        />

        <Route
          path="/caregiver/patients/:id"
          element={protect(
            <PatientDetailPage notify={notify} />,
            'caregiver'
          )}
        />

        {/* Shared notification page for authenticated users. */}
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              onRead={() => setUnread(0)}
              notify={notify}
            />
          }
        />

        {/* Patient report and caregiver report routes. */}
        <Route
          path="/report"
          element={
            user.role === 'patient' ? (
              <ReportPage patientId={user.id} />
            ) : (
              <Navigate
                to="/caregiver"
                replace
              />
            )
          }
        />

        <Route
          path="/report/:id"
          element={<ReportPage />}
        />

        {/* Shared settings page. */}
        <Route
          path="/settings"
          element={
            <SettingsPage
              user={user}
              setUser={setUser}
              notify={notify}
            />
          }
        />

        {/* Redirects unknown URLs to the user's home page. */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user.role === 'patient'
                  ? '/patient'
                  : '/caregiver'
              }
              replace
            />
          }
        />
      </Routes>

      {/* Displays application-wide toast messages. */}
      {toast && (
        <div
          className={`toast ${toast.type}`}
          key={toast.key}
        >
          {toast.message}
        </div>
      )}
    </Shell>
  );
}
