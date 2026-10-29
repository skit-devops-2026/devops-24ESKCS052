// import { readFile } from 'node:fs/promises';
// import { pool } from '../config/db.js';

// try {
//     const sql = await readFile(new URL('../../database/schema.sql', import.meta.url), 'utf8');
//     await pool.query(sql); console.log('Schema applied.')
// } catch (e) {
//     console.error('Migration failed:', e.message);
//     process.exitCode = 1
// } finally {
//     await pool.end()

// }


import { connectDatabase, closeDatabase } from '../config/db.js';
import { User, Medicine, Dose, CaregiverLink, Checkin, Notification } from '../models/index.js';
try {
    await connectDatabase();
    await Promise.all([User.init(), Medicine.init(), Dose.init(), CaregiverLink.init(), Checkin.init(), Notification.init()]);
    console.log('MongoDB collections and indexes are ready.');
} catch (e) {
    console.error('MongoDB initialization failed:', e.message);
    process.exitCode = 1;
} finally { await closeDatabase(); }

