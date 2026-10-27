import { useCallback, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { api, authToken } from './lib/api.js';
import AuthPage from './pages/AuthPage.jsx';
import PatientPage from './pages/PatientPage.jsx';
import MedicinesPage from './pages/MedicinesPage.jsx';
import CaregiverPage from './pages/CaregiverPage.jsx';
import PatientDetailPage from './pages/PatientDetailPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function Shell({ user, onLogout, unread, children }) {
  const links = user.role === 'patient'
    ? [{ to: '/patient', label: 'Overview', icon: '◫' }, { to: '/medicines', label: 'My medicines', icon: '✚' }, { to: '/report', label: 'Adherence report', icon: '▥' }]
    : [{ to: '/caregiver', label: 'My patients', icon: '♧' }];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">✚</span><span>MedRemind<span className="brand-plus">+</span><small>CARE COMPANION</small></span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{links.map(link => <NavLink key={link.to} to={link.to} end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className="nav-icon">{link.icon}</span>{link.label}</NavLink>)}
        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className="nav-icon">♧</span>Notifications {unread > 0 && <span className="unread-pill">{unread}</span>}</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className="nav-icon">⚙</span>Settings</NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="support-card"><span className="support-icon">♡</span><strong>Care starts with consistency.</strong><p>Small steps each day can make a difference.</p></div><div className="profile-row"><div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div><div className="profile-meta"><strong>{user.name}</strong><span>{user.role === 'patient' ? 'Patient account' : 'Caregiver account'}</span></div><button className="icon-button" onClick={onLogout} title="Log out" aria-label="Log out">↪</button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="topbar-label">MEDREMIND+ /</span> <strong>{user.role === 'patient' ? 'Patient space' : 'Caregiver space'}</strong></div><div className="topbar-right"><span className="status-dot"/> Connected account <div className="avatar small">{user.name?.slice(0, 1).toUpperCase()}</div></div></header><div className="page-content">{children}</div><footer className="footer">MedRemind+ · Your health routine, supported <span>For tracking only — not a replacement for professional medical advice.</span></footer></main>
  </div>;
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'success') => setToast({ message, type, key: Date.now() }), []);

  useEffect(() => {
    if (!authToken.get()) { setReady(true); return; }
    api('/auth/me').then(data => setUser(data.user)).catch(() => authToken.clear()).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!user) return;
    api('/notifications/unread-count').then(data => setUnread(Number(data.count || 0))).catch(() => {});
  }, [user]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 3500); return () => clearTimeout(timer); }, [toast]);

  const handleAuth = (data) => { authToken.set(data.token); setUser(data.user); setUnread(0); navigate(data.user.role === 'patient' ? '/patient' : '/caregiver'); };
  const logout = () => { authToken.clear(); setUser(null); setUnread(0); navigate('/'); };
  if (!ready) return <div className="loading-screen"><div className="brand-mark">✚</div><strong>Preparing your care space…</strong></div>;
  if (!user) return <><AuthPage onAuthenticated={handleAuth} notify={notify} />{toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}</>;

  const protect = (element, role) => role && user.role !== role ? <Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace /> : element;
  return <Shell user={user} onLogout={logout} unread={unread}>
    <Routes>
      <Route path="/" element={<Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace />} />
      <Route path="/patient" element={protect(<PatientPage user={user} notify={notify} />, 'patient')} />
      <Route path="/medicines" element={protect(<MedicinesPage notify={notify} />, 'patient')} />
      <Route path="/caregiver" element={protect(<CaregiverPage notify={notify} />, 'caregiver')} />
      <Route path="/caregiver/patients/:id" element={protect(<PatientDetailPage notify={notify} />, 'caregiver')} />
      <Route path="/notifications" element={<NotificationsPage onRead={() => setUnread(0)} notify={notify} />} />
      <Route path="/report" element={user.role === 'patient' ? <ReportPage patientId={user.id} /> : <Navigate to="/caregiver" replace />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} notify={notify} />} />
      <Route path="*" element={<Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace />} />
    </Routes>
    {toast && <div className={`toast ${toast.type}`} key={toast.key}>{toast.message}</div>}
  </Shell>;
}
