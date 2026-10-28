import { readFile } from 'node:fs/promises';
import { pool } from '../config/db.js';

try {
    const sql = await readFile(new URL('../../database/schema.sql', import.meta.url), 'utf8');
    await pool.query(sql); console.log('Schema applied.')
} catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1
} finally {
    await pool.end()

}
