// import { query } from '../config/db.js';
// export const health = async (_req, res) => { await query('SELECT 1'); res.json({ success: true, status: 'ok', service: 'medcare-appbackend' }) };


import { checkDatabaseConnection } from '../config/db.js';
export const health = async (_req, res) => { await checkDatabaseConnection(); res.json({ success: true, status: 'ok', service: 'medcare-appbackend' }) };
