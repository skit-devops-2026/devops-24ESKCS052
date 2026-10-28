import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';


export default function SettingsPage({ user, setUser, notify }) {
  const [form, setForm] = useState(
    {
      name: user.name || '', snooze_minutes: user.snooze_minutes ?? 10, grace_minutes: user.grace_minutes ?? 45
    }
  );

  const [invite, setInvite] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      name: user.name || '', snooze_minutes: user.snooze_minutes ?? 10, grace_minutes: user.grace_minutes ?? 45
    });
    if (user.role === 'patient') api('/patient/caregivers').then(d => {
      setInvite(d.invite_code);
      setCaregivers(d.caregivers || [])
    }).catch(() => { });
  }, [user]);

  const save = async e => {
    e.preventDefault(); setBusy(true);
    try {
      const body = { name: form.name };
      if (user.role === 'patient') {
        body.snooze_minutes = Number(form.snooze_minutes);
        body.grace_minutes = Number(form.grace_minutes)
      }
      const d = await api('/auth/settings', { method: 'PATCH', body });
      setUser(d.user);
      notify('Settings saved.');
    } catch (e) {
      notify(e.message, 'error')
    } finally { setBusy(false) }
  };

  const regen = async () => {
    try {
      const d = await api('/patient/caregivers/new-code', { method: 'POST' });
      setInvite(d.invite_code);
      notify('Invitation code refreshed.');
    } catch (e) {
      notify(e.message, 'error')
    }
  };

  return <div className="page-stack">
    <section className="page-title-row">
      <div>
        <span className="eyebrow">ACCOUNT PREFERENCES</span>
        <h1>Settings</h1>
        <p className="muted">Manage your profile and care preferences.</p>
      </div></section><section className="panel settings-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">PROFILE</span>
          <h2>Your account</h2>
        </div>
        <span className="status-badge connected">{user.role}</span>
      </div><form className="settings-form" onSubmit={save}>
        <label>Full name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} />
        </label>
        <label>Email address<input value={user.email} disabled />
          <small>Email changes are not supported in this version.</small>
        </label>{user.role === 'patient' &&
          <div className="settings-grid">
            <label>Snooze duration (minutes)
              <input type="number" min="1" max="60" value={form.snooze_minutes} onChange={e => setForm({ ...form, snooze_minutes: e.target.value })} />
            </label>
            <label>Missed-dose grace period (minutes)
              <input type="number" min="10" max="240" value={form.grace_minutes} onChange={e => setForm({ ...form, grace_minutes: e.target.value })} />
            </label>
          </div>}
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes →'}
        </button>
      </form>
    </section>{user.role === 'patient' &&
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SHARED CARE</span>
            <h2>Caregiver invitation</h2>
          </div>
          <span className="count-chip">{caregivers.length} connected</span>
        </div>
        <p className="muted">Share this code only with the caregiver you want to authorize to view your care information.</p>
        <div className="invite-code-box"><div>
          <small>Your current invite code</small>
          <strong>{invite || 'Loading…'}</strong>
        </div>
          <button className="btn ghost" onClick={() => invite && navigator.clipboard?.writeText(invite).then(() => notify('Invite code copied.')).catch(() => notify('Could not copy code.', 'error'))}>Copy code</button>
          <button className="btn primary" onClick={regen}>Generate new code</button>
        </div>{caregivers.length > 0 &&
          <div className="simple-list mt">{caregivers.map(c => <div className="simple-list-row" key={c.id}>
            <div className="avatar">{c.name?.slice(0, 1).toUpperCase()}</div><div className="grow">
              <strong>{c.name}</strong><small>{c.email}</small>
            </div>
            <span className="status-badge connected">Connected</span>
          </div>)}
          </div>}
      </section>}
    <section className="panel privacy-panel">
      <span className="privacy-icon">♧</span>
      <div>
        <h3>Your privacy matters</h3>
        <p>Only authenticated accounts with the appropriate role and patient-caregiver link should access protected records. Do not share your password or access token.</p>
      </div>
    </section>
  </div>;
}
