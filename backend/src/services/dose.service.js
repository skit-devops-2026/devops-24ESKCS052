// import * as repo from '../repositories/dose.repository.js';
// import { query, pool } from '../config/db.js';
// import { ApiError } from '../utils/ApiError.js';
// import { createNotification } from '../repositories/notification.repository.js';

// export async function today(patientId) {
//     await repo.ensureDoses(patientId);
//     return (await repo.todayDoses(patientId)).rows
// }

// export async function history(patientId, days) {
//     return (await repo.doseHistory(patientId, days)).rows
// }
// export async function act(patientId, doseId, action, snoozeMinutes = 10) {
//     if (!['take', 'skip', 'snooze'].includes(action))
//         throw new ApiError(404, 'Unknown dose action.');
//     const c = await pool.connect();
//     try {
//         await c.query('BEGIN');
//         const r = await c.query('SELECT d.*,m.name,m.stock,m.pills_per_dose FROM doses d JOIN medicines m ON m.id=d.medicine_id WHERE d.id=$1 AND d.patient_id=$2 FOR UPDATE OF d', [doseId, patientId]);
//         const d = r.rows[0];
//         if (!d) throw new ApiError(404, 'Dose not found.');
//         if (d.status === 'taken') throw new ApiError(409, 'Dose already taken.');
//         if (action === 'take') {
//             await c.query("UPDATE doses SET status='taken',taken_at=NOW(),snooze_until=NULL,updated_at=NOW() WHERE id=$1", [doseId]);
//             if (d.stock !== null) await c.query('UPDATE medicines SET stock=GREATEST(0,stock-$2) WHERE id=$1', [d.medicine_id, d.pills_per_dose])
//         }
//         else if (action === 'skip')
//             await c.query("UPDATE doses SET status='skipped',updated_at=NOW() WHERE id=$1", [doseId]);
//         else await c.query("UPDATE doses SET status='snoozed',snooze_until=NOW()+($2::text||' minutes')::interval,updated_at=NOW() WHERE id=$1", [doseId, snoozeMinutes]);
//         await c.query('COMMIT');
//         return { ok: true, action }
//     }
//     catch (e) { await c.query('ROLLBACK'); throw e }
//     finally { c.release() }
// }



import * as repo from '../repositories/dose.repository.js';
import { Dose, Medicine, Notification, CaregiverLink } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
export async function today(patientId) { await repo.ensureDoses(patientId); return (await repo.todayDoses(patientId)).rows }
export async function history(patientId, days) { return (await repo.doseHistory(patientId, days)).rows }

export async function act(patientId, doseId, action, snoozeMinutes = 10) {
    if (!['take', 'skip', 'snooze'].includes(action)) throw new ApiError(404, 'Unknown dose action.');
    const d = await Dose.findOne({ _id: doseId, patient_id: patientId });
    if (!d) throw new ApiError(404, 'Dose not found.');
    if (d.status === 'taken') throw new ApiError(409, 'Dose already taken.');
    if (action === 'take') {
        const updated = await Dose.findOneAndUpdate({ _id: doseId, patient_id: patientId, status: { $ne: 'taken' } }, { $set: { status: 'taken', taken_at: new Date(), snooze_until: null } }, { new: true });
        if (!updated) throw new ApiError(409, 'Dose already taken.');
        const m = await Medicine.findById(d.medicine_id);
        if (m && m.stock !== null && m.stock !== undefined) { m.stock = Math.max(0, m.stock - (m.pills_per_dose || 1)); await m.save(); }
    } else if (action === 'skip') {
        await Dose.updateOne({ _id: doseId, patient_id: patientId }, { $set: { status: 'skipped' } });
    } else {
        await Dose.updateOne({ _id: doseId, patient_id: patientId }, { $set: { status: 'snoozed', snooze_until: new Date(Date.now() + Number(snoozeMinutes) * 60000) } });
    }
    return { ok: true, action };
}
