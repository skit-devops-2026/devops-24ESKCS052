// import { query } from '../config/db.js';
// // Marks overdue pending doses as missed and creates alerts. Run from the scheduler, not from an HTTP request.
// export async function markMissedDoses() {
//     const r = await query(`WITH changed AS (UPDATE doses SET status='missed',updated_at=NOW() WHERE status='pending' AND dose_date=CURRENT_DATE AND scheduled_time < LOCALTIME - INTERVAL '45 minutes' RETURNING id,patient_id,medicine_id) SELECT c.patient_id,m.name FROM changed c JOIN medicines m ON m.id=c.medicine_id`); for (const row of r.rows) {
//         await query("INSERT INTO notifications(user_id,type,text) VALUES($1,'alert',$2)", [row.patient_id, `A scheduled dose of ${row.name} was marked missed.`]);
//         const links = await query('SELECT caregiver_id FROM caregiver_patient_links WHERE patient_id=$1', [row.patient_id]);
//         for (const l of links.rows) await query("INSERT INTO notifications(user_id,type,text) VALUES($1,'alert',$2)", [l.caregiver_id, `A linked patient's dose of ${row.name} was marked missed.`])
//     }
//     return r.rowCount
// }


import { Dose, Medicine, CaregiverLink } from '../models/index.js';
import { createNotification } from '../repositories/notification.repository.js';
export async function markMissedDoses() {
    const now = new Date(), today = now.toISOString().slice(0, 10), cutoff = new Date(now.getTime() - 45 * 60000).toISOString().slice(11, 16);
    const overdue = await Dose.find({ status: 'pending', dose_date: today, scheduled_time: { $lt: cutoff } }).lean(); let count = 0;
    for (const d of overdue) {
        const updated = await Dose.updateOne({ _id: d._id, status: 'pending' }, { $set: { status: 'missed' } });
        if (!updated.modifiedCount) continue; count++;
        const m = await Medicine.findById(d.medicine_id).lean();
        if (m) await createNotification(d.patient_id, 'alert', `A scheduled dose of ${m.name} was marked missed.`);
        const links = await CaregiverLink.find({ patient_id: d.patient_id }).lean();
        for (const l of links) if (m) await createNotification(l.caregiver_id, 'alert', `A linked patient's dose of ${m.name} was marked missed.`);
    }
    return count;
}
