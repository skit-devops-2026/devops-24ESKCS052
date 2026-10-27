# Database model
`users` holds patient and caregiver accounts. `caregiver_patient_links` authorizes caregiver access. `medicines` stores patient-owned medication schedules and stock. `doses` stores per-day dose state. `checkins` stores one mood check-in per patient/day. `notifications` stores in-app alerts.

Run `npm run db:migrate` against a new database. This SQL is a bootstrap schema, not a versioned migration framework; production changes should be added as ordered migrations.
