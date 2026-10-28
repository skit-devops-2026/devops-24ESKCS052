import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { linkSchema } from '../validators/caregiver.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/caregiver.controller.js';

const r = Router();
r.use(authenticate, requireRole('caregiver'));
r.post('/link', validateRequest(linkSchema), asyncHandler(c.link));
r.get('/patients', asyncHandler(c.listPatients));
r.get('/patients/:id', asyncHandler(c.patientDetails));
r.delete('/patients/:id', asyncHandler(c.unlink));
export default r;
