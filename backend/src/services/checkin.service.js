import * as repo from '../repositories/checkin.repository.js';
import { query } from '../config/db.js';
import { createNotification } from '../repositories/notification.repository.js';
export async function save(patientId, v) {
    const r = await repo.saveCheckin(patientId, v);
    if (v.mood <= 2) {
        const links = await query('SELECT caregiver_id FROM caregiver_patient_links WHERE patient_id=$1', [patientId]);
        for (const l of links.rows)
            await createNotification(l.caregiver_id, 'alert', 'A linked patient reported a low mood.')
    }
    return r.rows[0]
}
export async function today(id) {
    return (await repo.getTodayCheckin(id)).rows[0] || null
}
