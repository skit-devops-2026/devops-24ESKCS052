import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/notification.controller.js';

const r = Router();
r.use(authenticate);
r.get('/', asyncHandler(c.list));
r.get('/unread-count', asyncHandler(c.count));
r.post('/read-all', asyncHandler(c.readAll));
export default r;
