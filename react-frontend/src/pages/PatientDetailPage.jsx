
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function PatientDetailPage({ notify }) {
  // Retrieves the patient ID from the current URL.
  const { id } = useParams();

  // Stores the patient details returned by the backend.
  const [data, setData] = useState(null);

  // Stores the selected report period in days.
  const [days, setDays] = useState(30);

  // Fetches the selected patient's details when the ID changes.
  useEffect(() => {
    api(`/caregiver/patients/${id}`)
      .then(setData)
      .catch((e) => notify(e.message, 'error'));
  }, [id, notify]);

  // Displays a loading message until patient data is available.
  if (!data) {
    return (
      <div className="panel empty-state">
        Loading patient information…
      </div>
    );
  }

  // Extracts patient data with fallback values.
  const doses = data.today || [];
  const medicines = data.medicines || [];
  const report = data.report || {};

  // Counts the doses marked as taken today.
  const taken = doses.filter(
    (d) => d.status === 'taken'
  ).length;

  return (
    <div className="page-stack">
      {/* Navigation back to the caregiver dashboard. */}
      <div className="back-link">
        <Link to="/caregiver">← All patients</Link>
      </div>

      {/* Displays patient identity and report navigation. */}
      <section className="page-title-row">
        <div>
          <span className="eyebrow">SHARED CARE SUMMARY</span>

          <h1>{data.patient.name}</h1>

          <p className="muted">
            {data.patient.email}
          </p>
        </div>

        <Link
          className="btn primary"
          to={`/report/${id}`}
        >
          View report ↗
        </Link>
      </section>

      {/* Displays summary metrics for the selected patient. */}
      <section className="metric-grid">
        <Metric
          label="Doses today"
          value={`${taken}/${doses.length}`}
          icon="✓"
          tone="mint"
        />

        <Metric
          label="Active medicines"
          value={medicines.length}
          icon="✚"
          tone="lavender"
        />

        <Metric
          label="Recent check-ins"
          value={(data.checkins || []).length}
          icon="♡"
          tone="peach"
        />

        <Metric
          label="Report period"
          value="14 days"
          icon="▥"
          tone="blue"
        />
      </section>

      {/* Displays the medication status for today. */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">TODAY</span>
            <h2>Medication status</h2>
          </div>

          <span className="date-chip">
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {doses.length === 0 ? (
          <p className="muted">
            No doses scheduled today.
          </p>
        ) : (
          <div className="dose-list">
            {doses.map((d) => (
              <div
                className="dose-item"
                key={d.id}
              >
                <div
                  className={`dose-symbol ${d.status}`}
                >
                  ✚
                </div>

                <div className="dose-info">
                  <strong>{d.name}</strong>

                  <span>
                    {d.dosage ||
                      'Dosage not specified'}
                  </span>

                  <small>
                    {String(
                      d.scheduled_time || ''
                    ).slice(0, 5)}
                  </small>
                </div>

                <span
                  className={`status-badge ${d.status === 'taken'
                      ? 'taken'
                      : d.status === 'pending' ||
                        d.status === 'snoozed'
                        ? 'pending'
                        : 'missed'
                    }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Displays active medicines and recent patient check-ins. */}
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                MEDICATION LIST
              </span>

              <h2>Active medicines</h2>
            </div>
          </div>

          {medicines.length === 0 ? (
            <p className="muted">
              No active medicines.
            </p>
          ) : (
            <div className="simple-list">
              {medicines.map((m) => (
                <div
                  className="simple-list-row"
                  key={m.id}
                >
                  <div className="medicine-symbol small-symbol">
                    ✚
                  </div>

                  <div className="grow">
                    <strong>{m.name}</strong>

                    <small>
                      {m.dosage ||
                        'Dosage not specified'}{' '}
                      ·{' '}
                      {(m.times || [])
                        .map((t) =>
                          String(t).slice(0, 5)
                        )
                        .join(', ')}
                    </small>
                  </div>

                  <span className="stock-label">
                    {m.stock == null
                      ? 'Stock n/a'
                      : `${m.stock} pills`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Displays the patient's recent mood check-ins. */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">WELLNESS</span>
              <h2>Recent check-ins</h2>
            </div>
          </div>

          {!data.checkins?.length ? (
            <p className="muted">
              No check-ins recorded yet.
            </p>
          ) : (
            data.checkins.map((c) => (
              <div
                className="checkin-row"
                key={`${c.date}-${c.id || c.mood}`}
              >
                <span className="mood-dot">
                  {['☹', '🙁', '😐', '🙂', '☺'][
                    c.mood - 1
                  ]}
                </span>

                <div className="grow">
                  <strong>
                    {new Date(
                      `${c.date}T12:00:00`
                    ).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>

                  <p>
                    {c.note || 'No additional note'}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Provides access to the detailed medication adherence report. */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              MEDICATION HISTORY
            </span>

            <h2>Adherence report</h2>
          </div>

          <Link
            to={`/report/${id}`}
            className="text-link"
          >
            Open full report →
          </Link>
        </div>

        <p className="muted">
          Open the report for a date range and per-medicine
          summary. Only linked caregivers can access this
          information.
        </p>
      </section>
    </div>
  );
}

// Reusable component for displaying a patient summary metric.
function Metric({ label, value, icon, tone }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        {icon}
      </div>

      <span className="metric-label">
        {label}
      </span>

      <strong className="metric-value">
        {value}
      </strong>
    </div>
  );
}
