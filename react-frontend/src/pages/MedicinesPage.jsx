
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

// Defines the initial values for the medicine form.
const empty = {
  name: '',
  dosage: '',
  instructions: '',
  times: '08:00',
  stock: '',
  pills_per_dose: '1',
};

export default function MedicinesPage({ notify }) {
  // Stores the medicines retrieved from the backend.
  const [list, setList] = useState([]);

  // Stores the current values entered into the medicine form.
  const [form, setForm] = useState(empty);

  // Stores the ID of the medicine currently being edited.
  const [editing, setEditing] = useState(null);

  // Controls whether the add/edit form is visible.
  const [open, setOpen] = useState(false);

  // Tracks whether a medicine save request is in progress.
  const [busy, setBusy] = useState(false);

  // Fetches the patient's medicines from the backend.
  const load = useCallback(
    () => api('/patient/medicines').then(setList),
    []
  );

  // Loads the medicine list when the component mounts.
  useEffect(() => {
    load().catch((e) => notify(e.message, 'error'));
  }, [load, notify]);

  // Creates a reusable input handler for updating one form field.
  const update = (k) => (e) =>
    setForm((v) => ({
      ...v,
      [k]: e.target.value,
    }));

  // Loads an existing medicine into the form for editing.
  const edit = (m) => {
    setEditing(m.id);

    setForm({
      name: m.name || '',
      dosage: m.dosage || '',
      instructions: m.instructions || '',
      times: (m.times || [])
        .map((t) => String(t).slice(0, 5))
        .join(', '),
      stock: m.stock ?? '',
      pills_per_dose: String(m.pills_per_dose || 1),
    });

    setOpen(true);
  };

  // Resets the form and closes it.
  const reset = () => {
    setForm(empty);
    setEditing(null);
    setOpen(false);
  };

  // Validates the form submission and saves a medicine.
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);

    // Converts form values into the payload expected by the API.
    const body = {
      name: form.name,
      dosage: form.dosage,
      instructions: form.instructions,
      times: form.times
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      stock:
        form.stock === ''
          ? null
          : Number(form.stock),
      pills_per_dose: Number(form.pills_per_dose),
    };

    try {
      // Uses PUT for editing and POST for creating a medicine.
      await api(
        editing
          ? `/patient/medicines/${editing}`
          : '/patient/medicines',
        {
          method: editing ? 'PUT' : 'POST',
          body,
        }
      );

      // Notifies the user about the successful operation.
      notify(
        editing
          ? 'Medicine updated.'
          : 'Medicine added.'
      );

      // Clears the form and closes the editor.
      reset();

      // Refreshes the medicine list after saving.
      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      // Re-enables the form after the request finishes.
      setBusy(false);
    }
  };

  // Confirms and removes a medicine from the active list.
  const remove = async (m) => {
    if (
      !window.confirm(
        `Remove ${m.name} from your active medicines?`
      )
    ) {
      return;
    }

    try {
      // Sends a DELETE request for the selected medicine.
      await api(`/patient/medicines/${m.id}`, {
        method: 'DELETE',
      });

      notify('Medicine removed.');

      // Refreshes the list to reflect the deletion.
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <div className="page-stack">
      {/* Page heading and button for opening the medicine form. */}
      <section className="page-title-row">
        <div>
          <span className="eyebrow">YOUR ROUTINE</span>

          <h1>My medicines</h1>

          <p className="muted">
            Keep your medication details and daily times up to
            date.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => {
            setForm(empty);
            setEditing(null);
            setOpen((v) => !v);
          }}
        >
          ＋ Add medicine
        </button>
      </section>

      {/* Displays the form when adding or editing a medicine. */}
      {open && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                MEDICATION DETAILS
              </span>

              <h2>
                {editing
                  ? 'Edit medicine'
                  : 'Add a medicine'}
              </h2>
            </div>

            <button
              className="icon-button"
              onClick={reset}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form
            className="medicine-form"
            onSubmit={save}
          >
            {/* Medicine name input. */}
            <label>
              Medicine name

              <input
                value={form.name}
                onChange={update('name')}
                required
                maxLength={150}
                placeholder="e.g. Vitamin D"
              />
            </label>

            {/* Medicine dosage input. */}
            <label>
              Dosage

              <input
                value={form.dosage}
                onChange={update('dosage')}
                maxLength={100}
                placeholder="e.g. 1 tablet"
              />
            </label>

            {/* Accepts comma-separated medication times. */}
            <label>
              Scheduled times

              <input
                value={form.times}
                onChange={update('times')}
                required
                placeholder="08:00, 20:00"
              />

              <small>
                Use 24-hour times separated by commas,
                e.g. 08:00, 14:00, 20:00.
              </small>
            </label>

            {/* Tracks the available medicine stock. */}
            <label>
              Stock (pills)

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={update('stock')}
                placeholder="Leave blank if not tracked"
              />
            </label>

            {/* Defines the number of pills per dose. */}
            <label>
              Pills per dose

              <input
                type="number"
                min="1"
                max="100"
                value={form.pills_per_dose}
                onChange={update('pills_per_dose')}
                required
              />
            </label>

            {/* Accepts optional medication instructions. */}
            <label className="span-two">
              Instructions

              <textarea
                value={form.instructions}
                onChange={update('instructions')}
                maxLength={500}
                rows={2}
                placeholder="Optional instructions from your clinician"
              />
            </label>

            {/* Provides cancel and save actions. */}
            <div className="form-actions span-two">
              <button
                type="button"
                className="btn ghost"
                onClick={reset}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                disabled={busy}
              >
                {busy
                  ? 'Saving…'
                  : editing
                    ? 'Save changes'
                    : 'Add medicine'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Displays the active medicine list or an empty state. */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              ACTIVE MEDICATIONS
            </span>

            <h2>Your medicine list</h2>
          </div>

          <span className="count-chip">
            {list.length} active
          </span>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✚</div>

            <strong>No medicines added yet</strong>

            <p>
              Add your first medicine to start organizing your
              daily schedule.
            </p>

            <button
              className="btn primary"
              onClick={() => setOpen(true)}
            >
              Add first medicine
            </button>
          </div>
        ) : (
          <div className="medicine-grid">
            {list.map((m) => (
              <article
                className="medicine-card"
                key={m.id}
              >
                <div className="medicine-card-top">
                  <div className="medicine-symbol">
                    ✚
                  </div>

                  <span className="status-badge taken">
                    Active
                  </span>
                </div>

                <h3>{m.name}</h3>

                <p className="muted">
                  {m.dosage ||
                    'Dosage not specified'}
                </p>

                {/* Displays all scheduled times for this medicine. */}
                <div className="time-chips">
                  {(m.times || []).map((t) => (
                    <span key={t}>
                      ◷ {String(t).slice(0, 5)}
                    </span>
                  ))}
                </div>

                {/* Displays additional instructions when available. */}
                {m.instructions && (
                  <p className="medicine-instructions">
                    {m.instructions}
                  </p>
                )}

                {/* Displays the remaining tracked stock. */}
                <div className="medicine-stock">
                  <span>Stock</span>

                  <strong>
                    {m.stock === null
                      ? 'Not tracked'
                      : `${m.stock} pills`}
                  </strong>
                </div>

                {/* Provides editing and removal actions. */}
                <div className="medicine-actions">
                  <button
                    className="btn ghost"
                    onClick={() => edit(m)}
                  >
                    Edit details
                  </button>

                  <button
                    className="text-button danger-text"
                    onClick={() => remove(m)}
                  >
                    Remove
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
