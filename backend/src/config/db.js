import pg from 'pg';
import {env} from './env.js';
const {Pool}=pg;
export const pool=new Pool({connectionString:env.DATABASE_URL,max:10,idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
pool.on('error',e=>console.error('Unexpected PostgreSQL pool error:',e.message));
export const query=(text,params=[])=>pool.query(text,params);
export async function checkDatabaseConnection(){await query('SELECT 1')}
