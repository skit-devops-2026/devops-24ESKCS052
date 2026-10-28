import { ApiError } from '../utils/ApiError.js';
export const requireRole = (...roles) =>
    (req, _res, next) =>
        req.user && roles.includes(req.user.role) ? next() : next(new ApiError(403, 'Insufficient permissions.'));
