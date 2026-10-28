import { query } from '../config/db.js';
// Marks overdue pending doses as missed and creates alerts. Run from the scheduler, not from an HTTP request.
export async function markMissedDoses() {
    const r = await query(`WITH changed AS (UPDATE doses SET status='missed',updated_at=NOW() WHERE status='pending' AND dose_date=CURRENT_DATE AND scheduled_time < LOCALTIME - INTERVAL '45 minutes' RETURNING id,patient_id,medicine_id) SELECT c.patient_id,m.name FROM changed c JOIN medicines m ON m.id=c.medicine_id`); for (const row of r.rows) {
        await query("INSERT INTO notifications(user_id,type,text) VALUES($1,'alert',$2)", [row.patient_id, `A scheduled dose of ${row.name} was marked missed.`]);
        const links = await query('SELECT caregiver_id FROM caregiver_patient_links WHERE patient_id=$1', [row.patient_id]);
        for (const l of links.rows) await query("INSERT INTO notifications(user_id,type,text) VALUES($1,'alert',$2)", [l.caregiver_id, `A linked patient's dose of ${row.name} was marked missed.`])
    }
    return r.rowCount
}
