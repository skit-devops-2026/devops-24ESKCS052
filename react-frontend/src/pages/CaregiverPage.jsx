
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function CaregiverPage({ notify }) {
  // Stores the list of patients linked to the caregiver.
  const [patients, setPatients] = useState([]);

  // Stores the invitation code entered by the caregiver.
  const [code, setCode] = useState('');

  // Tracks whether a connection request is in progress.
  const [busy, setBusy] = useState(false);

  // Fetches linked patients and validates the API response format.
  const load = useCallback(async () => {
    const response = await api('/caregiver/patients');

    // Supports a direct array or common API response structures.
    const patientList = Array.isArray(response)
      ? response
      : Array.isArray(response?.rows)
        ? response.rows
        : Array.isArray(response?.patients)
          ? response.patients
          : null;

    // Rejects unexpected response formats instead of crashing during rendering.
    if (!patientList) {
      console.error(
        'Unexpected caregiver patients response:',
        response
      );

      throw new Error(
        'Could not load patients. Please check the API response.'
      );
    }

    // Updates the state with the validated patient list.
    setPatients(patientList);
  }, []);

  // Loads linked patients when the component mounts.
  useEffect(() => {
    load().catch((e) => notify(e.message, 'error'));
  }, [load, notify]);

  // Connects a patient using their invitation code.
  const connect = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      // Sends the normalized invitation code to the backend.
      const p = await api('/caregiver/link', {
        method: 'POST',
        body: {
          code: code.trim().toUpperCase(),
        },
      });

      // Confirms the successful connection.
      notify(`Connected with ${p.name || 'patient'}.`);

      // Clears the invitation code input.
      setCode('');

      // Refreshes the list to include the new patient.
      await load();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      // Re-enables the connection form after the request finishes.
      setBusy(false);
    }
  };

  // Confirms and disconnects a linked patient.
  const unlink = async (p) => {
    if (!window.confirm(`Disconnect from ${p.name}?`)) {
      return;
    }

    try {
      // Sends a DELETE request for the patient connection.
      await api(`/caregiver/patients/${p.id}`, {
        method: 'DELETE',
      });

      notify('Patient disconnected.');

      // Refreshes the list after disconnecting the patient.
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <div className="page-stack">
      {/* Page heading and caregiver illustration. */}
      <section className="page-title-row">
        <div>
          <span className="eyebrow">CAREGIVER SPACE</span>

          <h1>People in your care</h1>

          <p className="muted">
            Stay informed and support their medication routine.
          </p>
        </div>

        <div className="round-illustration">♡</div>
      </section>

      {/* Introduces the patient connection feature. */}
      <section className="caregiver-banner">
        <div className="care-icon">♧</div>

        <div>
          <span className="banner-kicker">CARE, TOGETHER</span>

          <h2>Being there makes a difference.</h2>

          <p>
            Connect using the invitation code shared by the
            patient. Their information stays private to
            authorized connections.
          </p>
        </div>
      </section>

      {/* Form for connecting a patient using an invitation code. */}
      <section className="panel connect-panel">
        <div>
          <span className="eyebrow">ADD A CONNECTION</span>

          <h2>Connect with a patient</h2>

          <p className="muted">
            Ask the patient to share their current invitation
            code.
          </p>
        </div>

        <form
          onSubmit={connect}
          className="connect-form"
        >
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            placeholder="Enter invite code"
            required
            maxLength={12}
            aria-label="Patient invitation code"
          />

          <button
            className="btn primary"
            disabled={busy}
          >
            {busy ? 'Connecting…' : 'Connect →'}
          </button>
        </form>
      </section>

      {/* Displays all patients linked to this caregiver. */}
      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR CONNECTIONS</span>

            <h2>
              Patient overview{' '}
              <span className="count-inline">
                {patients.length}
              </span>
            </h2>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="panel empty-state">
            <div className="empty-icon">♡</div>

            <strong>No patients connected yet</strong>

            <p>
              Once a patient connects with your invitation
              code, their shared care summary will appear
              here.
            </p>
          </div>
        ) : (
          <div className="patient-grid">
            {patients.map((p) => (
              <article
                className="panel patient-tile"
                key={p.id}
              >
                {/* Displays patient identity and connection status. */}
                <div className="patient-tile-head">
                  <div className="avatar large">
                    {p.name
                      ?.slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div className="grow">
                    <h3>{p.name}</h3>

                    <p className="muted">
                      {p.email}
                    </p>
                  </div>

                  <span className="status-badge connected">
                    Connected
                  </span>
                </div>

                {/* Displays basic patient connection information. */}
                <div className="patient-tile-stats">
                  <div>
                    <small>Patient ID</small>
                    <strong>#{p.id}</strong>
                  </div>

                  <div>
                    <small>Relationship</small>
                    <strong>Caregiver</strong>
                  </div>
                </div>

                {/* Provides patient details and disconnect actions. */}
                <div className="patient-tile-actions">
                  <Link
                    className="btn primary"
                    to={`/caregiver/patients/${p.id}`}
                  >
                    View care summary →
                  </Link>

                  <button
                    className="text-button danger-text"
                    onClick={() => unlink(p)}
                  >
                    Disconnect
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
