// import { query } from '../config/db.js';
// import { createNotification } from '../repositories/notification.repository.js';
// export const sos = async (req, res) => {
//     const links = await query('SELECT caregiver_id FROM caregiver_patient_links WHERE patient_id=$1', [req.user.id]);
//     for (const l of links.rows) await createNotification(l.caregiver_id, 'sos', `SOS alert from ${req.user.name}. Please check on them.`);
//     await createNotification(req.user.id, 'info', 'SOS alert submitted.'); res.json({ ok: true, recipients: links.rowCount })
// };


import { CaregiverLink } from '../models/index.js';
import { createNotification } from '../repositories/notification.repository.js';
export const sos = async (req, res) => { const links = await CaregiverLink.find({ patient_id: req.user.id }).lean(); for (const l of links) await createNotification(l.caregiver_id, 'sos', `SOS alert from ${req.user.name}. Please check on them.`); await createNotification(req.user.id, 'info', 'SOS alert submitted.'); res.json({ ok: true, recipients: links.length }) };
