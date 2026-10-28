import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { securityConfig } from './config/security.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: securityConfig.jsonLimit }));
app.use('/api/v1', apiRateLimiter, routes);
app.use(notFound);
app.use(errorHandler);
export default app;
