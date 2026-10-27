import rateLimit from 'express-rate-limit';
import {securityConfig} from '../config/security.js';
export const apiRateLimiter=rateLimit({windowMs:securityConfig.rateWindowMs,limit:securityConfig.rateLimit,standardHeaders:'draft-8',legacyHeaders:false});
