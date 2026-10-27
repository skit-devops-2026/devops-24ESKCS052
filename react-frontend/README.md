# MedCare React Frontend (MedRemind+)

React + Vite frontend wired to the `medcare-appbackend-complete` Express API. It uses the backend's real authentication, role-based routes, PostgreSQL-backed data and JSON response contracts. The UI does not use the old mock server.

## Requirements
- Node.js 20+ (use a Node version compatible with the Vite version in package.json)
- The `medcare-appbackend-complete` backend running on port 4000
- PostgreSQL configured and migrated for the backend

## Setup (Windows PowerShell)
1. Extract this ZIP.
2. Open PowerShell in `medcare-react-frontend`.
3. Create frontend environment config:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Install packages:
   ```powershell
   npm install
   ```
5. Start the frontend:
   ```powershell
   npm run dev
   ```
6. Open the local URL printed by Vite, normally `http://localhost:5173`.

The default API URL is `http://localhost:4000/api/v1`. If your backend uses a different address, change `VITE_API_BASE_URL` in `.env` and restart Vite. The backend's `CORS_ORIGINS` must include the frontend origin, e.g. `http://localhost:5173`.

## Screens and connected operations
- Signup/login for patient and caregiver accounts; JWT stored in sessionStorage.
- Patient overview: today's doses, take/snooze/skip, daily mood check-in, SOS.
- Medicines: list/create/update/archive medicines.
- Caregiver dashboard: link by invitation code and list linked patients.
- Patient detail: today's dose status, medicine list, check-ins.
- Notifications: list and mark all read.
- Reports: selected time range, per-medicine summary, daily activity and print-to-PDF.
- Settings: profile, patient snooze/grace preferences, invitation code and caregiver connections.

## API compatibility notes
The frontend calls endpoints that exist in the backend ZIP: `/auth/signup`, `/auth/login`, `/auth/me`, `/auth/settings`, `/patient/medicines`, `/patient/doses/today`, `/patient/doses/:id/:action`, `/patient/checkin`, `/patient/sos`, `/patient/caregivers`, `/caregiver/link`, `/caregiver/patients`, `/caregiver/patients/:id`, `/notifications`, and `/reports/:id`.

The backend's report endpoint returns `daily` and `medicines` summaries; the frontend uses that shape rather than the mock frontend's older `stats` response. Browser notifications and real-time push are not implemented here. Refresh a page to load the latest server data.

## Security notes
- Keep `.env` out of version control.
- HTTPS is required for deployment; local HTTP is for development only.
- The frontend hides role-incompatible pages for usability, but backend middleware must remain the source of authorization.
- This application is not a medical device or emergency response service. Do not use it as the sole source of medication or emergency decisions.
