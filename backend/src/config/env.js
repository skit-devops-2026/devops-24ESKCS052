import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 PORT:z.coerce.number().int().min(1).max(65535).default(4000),
 CORS_ORIGINS:z.string().default('http://localhost:5173'), DATABASE_URL:z.string().min(1),
 JWT_SECRET:z.string().min(32), JWT_EXPIRES_IN:z.string().default('8h'),
 BCRYPT_ROUNDS:z.coerce.number().int().min(10).max(15).default(12),
 REMINDER_POLL_SECONDS:z.coerce.number().int().min(15).default(60)
});
const result=schema.safeParse(process.env);
if(!result.success){console.error('Invalid environment configuration:',result.error.flatten().fieldErrors);process.exit(1)}
export const env=Object.freeze(result.data);
