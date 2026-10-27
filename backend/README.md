# MedCare AppBackend

Layered Express/PostgreSQL backend for MedRemind+: routes → controllers → services → repositories. Patient and caregiver access is enforced server-side.

## Setup (PowerShell)
1. `Copy-Item .env.example .env`
2. Edit `.env`; set a unique `JWT_SECRET` of 32+ characters.
3. `docker compose up -d postgres`
4. `npm install`
5. `npm run db:migrate`
6. `npm run dev`
7. Check `http://localhost:4000/api/v1/health`

The default Compose database password is for local development only. Set matching secure credentials before sharing/deploying.

## Architecture
See `docs/API.md` and `docs/DATABASE.md`. The frontend should set `VITE_API_BASE_URL=http://localhost:4000/api/v1` and replace its mock `src/api.js` implementation with HTTP calls. Request/response mapping still needs to be verified against each page in the provided frontend.

## Important limitations before production
- This is a substantial starter, not a certified medical system. Review all flows, add integration tests, audit logs, secrets management, backups, TLS, monitoring and privacy/legal review before real patient data.
- Reminder job marks pending doses missed after a fixed 45-minute grace period. It does not send SMS/email/push notifications; notifications are in-app database records only. Configure the desired timezone and reminder policy before use.
- Database schema is a bootstrap, not a fully versioned migration system.
- Run tests with `npm test`; run a local integration smoke test after configuring PostgreSQL.
