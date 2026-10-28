import { Router } from 'express';
import health from './health.routes.js';
import auth from './auth.routes.js';
import patients from './patients.routes.js';
import caregivers from './caregivers.routes.js';
import notifications from './notifications.routes.js';
import reports from './reports.routes.js';
import users from './users.routes.js';

const r = Router();
r.use('/health', health);
r.use('/auth', auth);
r.use('/patient', patients);
r.use('/caregiver', caregivers);
r.use('/notifications', notifications);
r.use('/reports', reports);
r.use('/users', users);
export default r;
