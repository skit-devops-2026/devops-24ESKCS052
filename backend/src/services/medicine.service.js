// import * as repo from '../repositories/medicine.repository.js';
// import { ApiError } from '../utils/ApiError.js';

// export const list = async id => (await repo.listMedicines(id)).rows;

// export async function create(id, v) { return (await repo.createMedicine(id, v)).rows[0] }
// export async function update(id, medicineId, v) {
//     const r = await repo.updateMedicine(id, medicineId, v);
//     if (!r.rowCount) throw new ApiError(404, 'Medicine not found.');
//     return r.rows[0]
// }
// export async function archive(id, medicineId) {
//     const r = await repo.archiveMedicine(id, medicineId);
//     if (!r.rowCount) throw new ApiError(404, 'Medicine not found.');
//     return { ok: true }
// }


// import * as repo from '../repositories/dose.repository.js';
// import { Dose, Medicine, Notification, CaregiverLink } from '../models/index.js';
// import { ApiError } from '../utils/ApiError.js';
// export async function today(patientId) { await repo.ensureDoses(patientId); return (await repo.todayDoses(patientId)).rows }
// export async function history(patientId, days) { return (await repo.doseHistory(patientId, days)).rows }

// export async function act(patientId, doseId, action, snoozeMinutes = 10) {
//     if (!['take', 'skip', 'snooze'].includes(action)) throw new ApiError(404, 'Unknown dose action.');
//     const d = await Dose.findOne({ _id: doseId, patient_id: patientId });
//     if (!d) throw new ApiError(404, 'Dose not found.');
//     if (d.status === 'taken') throw new ApiError(409, 'Dose already taken.');
//     if (action === 'take') {
//         const updated = await Dose.findOneAndUpdate({ _id: doseId, patient_id: patientId, status: { $ne: 'taken' } }, { $set: { status: 'taken', taken_at: new Date(), snooze_until: null } }, { new: true });
//         if (!updated) throw new ApiError(409, 'Dose already taken.');
//         const m = await Medicine.findById(d.medicine_id);
//         if (m && m.stock !== null && m.stock !== undefined) { m.stock = Math.max(0, m.stock - (m.pills_per_dose || 1)); await m.save(); }
//     } else if (action === 'skip') {
//         await Dose.updateOne({ _id: doseId, patient_id: patientId }, { $set: { status: 'skipped' } });
//     } else {
//         await Dose.updateOne({ _id: doseId, patient_id: patientId }, { $set: { status: 'snoozed', snooze_until: new Date(Date.now() + Number(snoozeMinutes) * 60000) } });
//     }
//     return { ok: true, action };
// }


import * as repo from '../repositories/medicine.repository.js';
import { ApiError } from '../utils/ApiError.js';
export const list = async id => (await repo.listMedicines(id)).rows;
export async function create(id, v) { return (await repo.createMedicine(id, v)).rows[0] }
export async function update(id, medicineId, v) { const r = await repo.updateMedicine(id, medicineId, v); if (!r.rowCount) throw new ApiError(404, 'Medicine not found.'); return r.rows[0] }
export async function archive(id, medicineId) { const r = await repo.archiveMedicine(id, medicineId); if (!r.rowCount) throw new ApiError(404, 'Medicine not found.'); return { ok: true } }
