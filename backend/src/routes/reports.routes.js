import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { get } from '../controllers/report.controller.js';

const r = Router();
r.use(authenticate);
r.get('/:id', asyncHandler(get));
export default r;
