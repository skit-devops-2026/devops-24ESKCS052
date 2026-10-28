
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

// Converts a scheduled time into a readable 12-hour time format.
const timeLabel = (value) =>
  value
    ? new Date(
      `1970-01-01T${String(value).slice(0, 8).length === 8
        ? String(value).slice(0, 8)
        : String(value).slice(0, 5)
      }Z`
    ).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    : '—';

// Defines labels for the five available mood levels.
const moodLabels = ['Very low', 'Low', 'Okay', 'Good', 'Great'];

export default function PatientPage({ user, notify }) {
  // Stores today's scheduled medication doses.
  const [doses, setDoses] = useState([]);

  // Stores the patient's active medicines.
  const [medicines, setMedicines] = useState([]);

  // Stores the patient's existing daily check-in.
  const [checkin, setCheckin] = useState(null);

  // Stores the selected mood level, from 1 to 5.
  const [mood, setMood] = useState(4);

  // Stores the optional daily check-in note.
  const [note, setNote] = useState('');

  // Tracks whether the initial patient data is loading.
  const [loading, setLoading] = useState(true);

  // Tracks which dose action is currently being processed.
  const [busyId, setBusyId] = useState(null);

  // Fetches doses, medicines, and the daily check-in concurrently.
  const load = useCallback(async () => {
    const [doseRows, medicineRows, moodRow] = await Promise.all([
      api('/patient/doses/today'),
      api('/patient/medicines'),
      api('/patient/checkin'),
    ]);

    setDoses(doseRows);
    setMedicines(medicineRows);
    setCheckin(moodRow);

    // Restores previously saved check-in values when available.
    if (moodRow) {
      setMood(moodRow.mood);
      setNote(moodRow.note || '');
    }
  }, []);

  // Loads patient data when the component mounts.
  useEffect(() => {
    load()
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [load, notify]);

  // Handles taking, skipping, or snoozing a medication dose.
  const act = async (id, action) => {
    setBusyId(id);

    try {
      // Sends the requested dose action to the backend.
      await api(`/patient/doses/${id}/${action}`, {
        method: 'POST',
      });

      // Displays a message describing the completed action.
      notify(
        action === 'take'
          ? 'Dose marked as taken.'
          : action === 'skip'
            ? 'Dose marked as skipped.'
            : 'Dose snoozed.'
      );

      // Refreshes the schedule to reflect the updated dose.
      await load();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      // Re-enables dose actions after the request finishes.
      setBusyId(null);
    }
  };

  // Saves the patient's daily mood and optional note.
  const saveCheckin = async (e) => {
    e.preventDefault();

    try {
      // Submits the check-in data to the backend.
      const result = await api('/patient/checkin', {
        method: 'POST',
        body: { mood, note },
      });

      setCheckin(result);

      notify('Your daily check-in is saved.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  // Requests confirmation before sending an SOS notification.
  const sos = async () => {
    if (
      !window.confirm(
        'Send an SOS notification to your linked caregivers?'
      )
    ) {
      return;
    }

    try {
      // Sends the SOS request to the backend.
      const result = await api('/patient/sos', {
        method: 'POST',
      });

      // Reports whether any caregivers received the SOS.
      notify(
        result.recipients
          ? `SOS sent to ${result.recipients} caregiver(s).`
          : 'SOS submitted, but no caregivers are linked.',
        result.recipients ? 'success' : 'error'
      );
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  // Counts doses that have been marked as taken.
  const taken = doses.filter(
    (d) => d.status === 'taken'
  ).length;

  // Counts doses that are pending or snoozed.
  const pending = doses.filter((d) =>
    ['pending', 'snoozed'].includes(d.status)
  ).length;

  // Calculates the percentage of scheduled doses marked as taken.
  const completed = doses.length
    ? Math.round((taken / doses.length) * 100)
    : 0;

  // Determines the greeting based on the current local hour.
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  return (
    <div className="page-stack">
      {/* Welcome section and emergency SOS action. */}
      <section className="welcome-row">
        <div>
          <span className="eyebrow">YOUR DAILY WELLNESS</span>

          <h1>
            {greeting}, {user.name.split(' ')[0]}{' '}
            <span className="wave">✦</span>
          </h1>

          <p className="muted">
            One step at a time. Let’s keep your care routine on
            track.
          </p>
        </div>

        <button className="btn danger" onClick={sos}>
          <span>♡</span> Send SOS
        </button>
      </section>

      {/* Hero banner with a link to medicine management. */}
      <section className="hero-banner">
        <div>
          <span className="banner-kicker">
            TODAY IS A FRESH START
          </span>

          <h2>
            Care for yourself,
            <br />
            one dose at a time.
          </h2>

          <p>
            You’re doing something important by showing up for
            your health.
          </p>

          <Link
            className="btn banner-btn"
            to="/medicines"
          >
            Manage medicines <span>→</span>
          </Link>
        </div>

        <div className="banner-art">
          <div className="art-circle circle-a" />
          <div className="art-circle circle-b" />

          <div className="pill-illustration">
            <span>✚</span>
          </div>

          <div className="art-spark spark-a">✦</div>
          <div className="art-spark spark-b">✧</div>
        </div>
      </section>

      {/* Displays medication and daily progress metrics. */}
      <section className="metric-grid">
        <Metric
          label="Doses taken"
          value={`${taken} / ${doses.length}`}
          detail="Today's schedule"
          icon="✓"
          tone="mint"
        />

        <Metric
          label="Still to take"
          value={pending}
          detail="Pending or snoozed"
          icon="◷"
          tone="lavender"
        />

        <Metric
          label="Today's progress"
          value={`${completed}%`}
          detail="Based on scheduled doses"
          icon="↗"
          tone="peach"
        />

        <Metric
          label="Medicines"
          value={medicines.length}
          detail="Active in your routine"
          icon="✚"
          tone="blue"
        />
      </section>

      {/* Main content: medication schedule and daily check-in. */}
      <div className="content-grid">
        <section className="panel dose-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR SCHEDULE</span>
              <h2>Today’s medication</h2>
            </div>

            <span className="date-chip">
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                weekday: 'short',
              })}
            </span>
          </div>

          {/* Shows loading, empty, or medication-list content. */}
          {loading ? (
            <Loading />
          ) : doses.length === 0 ? (
            <Empty
              title="No doses scheduled today"
              text="Add a medicine and its schedule to start your routine."
              action={
                <Link
                  to="/medicines"
                  className="text-link"
                >
                  Add a medicine →
                </Link>
              }
            />
          ) : (
            <div className="dose-list">
              {doses.map((dose) => (
                <div
                  className="dose-item"
                  key={dose.id}
                >
                  <div
                    className={`dose-symbol ${dose.status}`}
                  >
                    <span>✚</span>
                  </div>

                  <div className="dose-info">
                    <strong>{dose.name}</strong>

                    <span>
                      {dose.dosage ||
                        'Dosage not specified'}
                      {dose.instructions
                        ? ` · ${dose.instructions}`
                        : ''}
                    </span>

                    <small>
                      {timeLabel(dose.scheduled_time)}
                    </small>
                  </div>

                  <div className="dose-actions">
                    {dose.status === 'taken' ? (
                      <span className="status-badge taken">
                        ✓ Taken
                      </span>
                    ) : dose.status === 'skipped' ||
                      dose.status === 'missed' ? (
                      <span className="status-badge missed">
                        {dose.status}
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn tiny primary"
                          disabled={
                            busyId === dose.id
                          }
                          onClick={() =>
                            act(dose.id, 'take')
                          }
                        >
                          Take
                        </button>

                        <button
                          className="btn tiny ghost"
                          disabled={
                            busyId === dose.id
                          }
                          onClick={() =>
                            act(dose.id, 'snooze')
                          }
                        >
                          Snooze
                        </button>

                        <button
                          className="text-button"
                          disabled={
                            busyId === dose.id
                          }
                          onClick={() =>
                            act(dose.id, 'skip')
                          }
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Displays the overall daily completion percentage. */}
          <div className="panel-foot">
            <span className="progress-label">
              Daily progress
            </span>

            <strong>{completed}%</strong>

            <div className="progress-track">
              <span
                style={{ width: `${completed}%` }}
              />
            </div>
          </div>
        </section>

        {/* Daily mood selection and optional notes form. */}
        <section className="panel checkin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                HOW ARE YOU FEELING?
              </span>

              <h2>Daily check-in</h2>
            </div>

            <span className="mood-heart">♡</span>
          </div>

          <p className="muted small-text">
            A quick check-in helps your care team understand how
            you’re doing.
          </p>

          <form onSubmit={saveCheckin}>
            <div className="mood-options">
              {['☹', '🙁', '😐', '🙂', '☺'].map(
                (face, i) => (
                  <button
                    type="button"
                    key={face}
                    onClick={() => setMood(i + 1)}
                    className={`mood-option ${mood === i + 1 ? 'selected' : ''
                      }`}
                    aria-label={moodLabels[i]}
                  >
                    <span>{face}</span>
                    <small>{moodLabels[i]}</small>
                  </button>
                )
              )}
            </div>

            <label className="field-label">
              Anything you want to share?

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Optional note about your day…"
              />
            </label>

            <button
              className="btn primary full"
              type="submit"
            >
              {checkin
                ? 'Update check-in'
                : 'Save check-in'}{' '}
              <span>→</span>
            </button>

            {checkin && (
              <p className="saved-note">
                ✓ Check-in saved for today
              </p>
            )}
          </form>
        </section>
      </div>

      {/* Encourages patients to connect with trusted caregivers. */}
      <section className="bottom-callout">
        <div className="callout-icon">♡</div>

        <div>
          <strong>You don’t have to do it alone.</strong>

          <p>
            Connect with someone you trust to share your
            medication progress and important alerts.
          </p>
        </div>

        <Link to="/settings" className="text-link">
          Your account →
        </Link>
      </section>
    </div>
  );
}

// Reusable component for displaying a single dashboard metric.
function Metric({ label, value, detail, icon, tone }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>

      <span className="metric-label">{label}</span>

      <strong className="metric-value">{value}</strong>

      <small>{detail}</small>
    </div>
  );
}

// Reusable component for displaying a loading message.
function Loading() {
  return (
    <div className="empty-state">
      Loading your care information…
    </div>
  );
}

// Reusable component for displaying an empty state with an optional action.
function Empty({ title, text, action }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}
