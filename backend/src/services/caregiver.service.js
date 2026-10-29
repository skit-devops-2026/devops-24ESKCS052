// import { query } from '../config/db.js';
// import * as repo from '../repositories/caregiver.repository.js';
// import { ApiError } from '../utils/ApiError.js';
// import { createNotification } from '../repositories/notification.repository.js';
// export async function linkByCode(caregiver, code) {
//     const p = await query("SELECT id,name FROM users WHERE role='patient' AND invite_code=$1 AND is_active=TRUE", [code.toUpperCase()]);
//     if (!p.rowCount) throw new ApiError(404, 'Invitation code is invalid.');
//     try { await repo.linkPatient(p.rows[0].id, caregiver.id) }
//     catch (e) {
//         if (e.code === '23505') throw new ApiError(409, 'Already linked to this patient.');
//         throw e
//     } await createNotification(p.rows[0].id, 'info', `${caregiver.name} connected as caregiver.`);
//     return { id: p.rows[0].id, name: p.rows[0].name }
// }
// export async function unlink(patientId, caregiverId) {
//     const r = await repo.unlinkPatient(patientId, caregiverId);
//     if (!r.rowCount) throw new ApiError(404, 'Patient link not found.');
//     return { ok: true }
// }


import { User, CaregiverLink } from '../models/index.js';
import * as repo from '../repositories/caregiver.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from '../repositories/notification.repository.js';
export async function linkByCode(caregiver, code) { const p = await User.findOne({ role: 'patient', invite_code: code.toUpperCase(), is_active: true }).lean(); if (!p) throw new ApiError(404, 'Invitation code is invalid.'); try { await repo.linkPatient(p._id, caregiver.id) } catch (e) { if (e.code === 11000) throw new ApiError(409, 'Already linked to this patient.'); throw e } await createNotification(p._id, 'info', `${caregiver.name} connected as caregiver.`); return { id: String(p._id), name: p.name } }
export async function unlink(patientId, caregiverId) { const r = await repo.unlinkPatient(patientId, caregiverId); if (!r.rowCount) throw new ApiError(404, 'Patient link not found.'); return { ok: true } }
