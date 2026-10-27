# API reference
Base URL: `/api/v1`. Authenticated requests use `Authorization: Bearer <token>`.

- `GET /health` — database-backed health check.
- `POST /auth/signup` — `{name,email,password,role}`; role is `patient` or `caregiver`.
- `POST /auth/login` — `{email,password}`.
- `GET /auth/me` — current account.
- `PATCH /auth/settings` — `{name?,snooze_minutes?,grace_minutes?}`.
- Patient-only: `GET/POST /patient/medicines`, `PUT/DELETE /patient/medicines/:id`, `GET /patient/doses/today`, `GET /patient/doses/history?days=30`, `POST /patient/doses/:id/take|skip|snooze`, `GET/POST /patient/checkin`, `POST /patient/sos`, `GET /patient/caregivers`, `POST /patient/caregivers/new-code`.
- Caregiver-only: `POST /caregiver/link` `{code}`, `GET /caregiver/patients`, `GET /caregiver/patients/:id`, `DELETE /caregiver/patients/:id`.
- Shared: `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`, `GET /reports/:patientId?days=30` (own patient or linked caregiver only).

All response payloads are JSON. Validate frontend contracts before production integration.
