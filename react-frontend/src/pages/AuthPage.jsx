
import { useState } from 'react';
import { api } from '../lib/api.js';

export default function AuthPage({ onAuthenticated, notify }) {
  // Controls whether the user is logging in or creating an account.
  const [mode, setMode] = useState('login');

  // Stores the values entered in the authentication form.
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });

  // Tracks whether an authentication request is in progress.
  const [busy, setBusy] = useState(false);

  // Creates a reusable handler for updating individual form fields.
  const update = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));

  // Submits login or signup credentials to the backend.
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      // Selects the appropriate endpoint and request payload.
      const data = await api(
        `/auth/${mode === 'login' ? 'login' : 'signup'}`,
        {
          method: 'POST',
          body:
            mode === 'login'
              ? {
                email: form.email,
                password: form.password,
              }
              : form,
        }
      );

      // Passes the authenticated user's data to the parent component.
      onAuthenticated(data);
    } catch (error) {
      // Displays an error message when authentication fails.
      notify(
        error.message || 'Unable to authenticate.',
        'error'
      );
    } finally {
      // Re-enables the form after the request completes.
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left panel: branding and product introduction. */}
      <section className="auth-visual">
        <div className="brand light">
          <span className="brand-mark">✚</span>

          <span>
            MedRemind
            <span className="brand-plus">+</span>
            <small>CARE COMPANION</small>
          </span>
        </div>

        <div className="hero-copy">
          <span className="eyebrow light-eyebrow">
            A LITTLE CARE, EVERY DAY
          </span>

          <h1>
            Feel supported.
            <br />
            <em>Stay on track.</em>
          </h1>

          <p>
            Medication routines, gentle accountability and
            trusted people — all working together in one calmer
            place.
          </p>

          {/* Highlights the main benefits of the application. */}
          <div className="hero-points">
            <div>
              <span>✓</span> Keep your medication routine
              organized
            </div>

            <div>
              <span>✓</span> Share updates with the people who
              care
            </div>

            <div>
              <span>✓</span> See your progress over time
            </div>
          </div>
        </div>

        <div className="hero-foot">
          Thoughtfully designed for everyday care.
        </div>

        {/* Decorative elements used by the page styling. */}
        <div className="decor decor-one" />
        <div className="decor decor-two" />
      </section>

      {/* Right panel: login and account creation form. */}
      <section className="auth-panel">
        <div className="auth-form-wrap">
          {/* Displays compact branding on mobile screens. */}
          <div className="mobile-brand brand">
            <span className="brand-mark">✚</span>

            <span>
              MedRemind
              <span className="brand-plus">+</span>
            </span>
          </div>

          <span className="eyebrow">YOUR CARE SPACE</span>

          <h2>
            {mode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </h2>

          <p className="muted">
            {mode === 'login'
              ? 'Sign in to continue your care routine.'
              : 'Start building a routine that works for you.'}
          </p>

          {/* Allows switching between login and signup modes. */}
          <div className="auth-tabs">
            <button
              className={
                mode === 'login' ? 'selected' : ''
              }
              onClick={() => setMode('login')}
              type="button"
            >
              Log in
            </button>

            <button
              className={
                mode === 'signup' ? 'selected' : ''
              }
              onClick={() => setMode('signup')}
              type="button"
            >
              Create account
            </button>
          </div>

          {/* Authentication form with mode-dependent fields. */}
          <form
            onSubmit={submit}
            className="form-stack"
          >
            {mode === 'signup' && (
              <>
                {/* Collects the user's full name during signup. */}
                <label>
                  Full name

                  <input
                    value={form.name}
                    onChange={update('name')}
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                    maxLength={100}
                  />
                </label>

                {/* Lets the user select their account role. */}
                <label>
                  Choose account type

                  <select
                    value={form.role}
                    onChange={update('role')}
                  >
                    <option value="patient">
                      Patient — manage my medicines
                    </option>

                    <option value="caregiver">
                      Caregiver — support someone
                    </option>
                  </select>
                </label>
              </>
            )}

            {/* Collects the user's email address. */}
            <label>
              Email address

              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
              />
            </label>

            {/* Collects the password for login or signup. */}
            <label>
              Password

              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                placeholder={
                  mode === 'login'
                    ? 'Enter your password'
                    : 'At least 6 characters'
                }
                required
                minLength={6}
                maxLength={128}
              />
            </label>

            {/* Submits the current authentication request. */}
            <button
              className="btn primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in securely →'
                  : 'Create account →'}
            </button>
          </form>

          {/* Provides an alternative authentication mode. */}
          <p className="auth-switch">
            {mode === 'login'
              ? 'New to MedRemind+?'
              : 'Already have an account?'}

            {' '}

            <button
              onClick={() =>
                setMode(
                  mode === 'login'
                    ? 'signup'
                    : 'login'
                )
              }
              type="button"
            >
              {mode === 'login'
                ? 'Create an account'
                : 'Log in'}
            </button>
          </p>

          {/* Displays the application's authentication and emergency disclaimer. */}
          <p className="privacy-note">
            Your account is protected by authenticated access.
            This app is not an emergency medical service.
          </p>
        </div>
      </section>
    </div>
  );
}
