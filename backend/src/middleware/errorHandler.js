import { logger } from '../config/logger.js';
export function errorHandler(error, _req, res, _next) {
    const status = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500;
    if (status === 500) logger.error('Unhandled request error', { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }); res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : error.message, ...(error.details ? { details: error.details } : {}) })
}
