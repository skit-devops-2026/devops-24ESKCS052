// import {query} from '../config/db.js';
// export const ensureDoses=patientId=>query(`INSERT INTO doses(medicine_id,patient_id,dose_date,scheduled_time) SELECT m.id,m.patient_id,CURRENT_DATE,t.tm::time FROM medicines m CROSS JOIN LATERAL unnest(m.times) t(tm) WHERE m.patient_id=$1 AND m.active=TRUE ON CONFLICT(medicine_id,dose_date,scheduled_time) DO NOTHING`,[patientId]);
// export const todayDoses=patientId=>query(`SELECT d.id,d.patient_id,d.medicine_id,d.dose_date::text AS date,to_char(d.scheduled_time,'HH24:MI') AS scheduled_time,d.status,d.taken_at,d.snooze_until,m.name,m.dosage,m.instructions FROM doses d JOIN medicines m ON m.id=d.medicine_id WHERE d.patient_id=$1 AND d.dose_date=CURRENT_DATE AND m.active=TRUE ORDER BY d.scheduled_time`,[patientId]);
// export const doseHistory=(patientId,days)=>query(`SELECT d.id,d.medicine_id,d.dose_date::text AS date,to_char(d.scheduled_time,'HH24:MI') AS scheduled_time,d.status,d.taken_at,m.name,m.dosage FROM doses d JOIN medicines m ON m.id=d.medicine_id WHERE d.patient_id=$1 AND d.dose_date>=CURRENT_DATE-($2::int-1) ORDER BY d.dose_date DESC,d.scheduled_time DESC`,[patientId,days]);

import { Dose, Medicine } from '../models/index.js';
const day = () => new Date().toISOString().slice(0, 10);
const time = t => String(t || '').slice(0, 5);
const shape = d => ({ ...d, id: String(d._id), patient_id: String(d.patient_id), medicine_id: String(d.medicine_id), date: d.dose_date, scheduled_time: time(d.scheduled_time) });
export async function ensureDoses(patientId) {
    const meds = await Medicine.find({ patient_id: patientId, active: true }).lean(); let made = 0;
    for (const m of meds) for (const t of m.times || []) {
        try { await Dose.updateOne({ medicine_id: m._id, dose_date: day(), scheduled_time: time(t) }, { $setOnInsert: { medicine_id: m._id, patient_id: patientId, dose_date: day(), scheduled_time: time(t), status: 'pending' } }, { upsert: true }); made++; } catch (e) { if (e.code !== 11000) throw e; }
    }
    return { rowCount: made };
}
export async function todayDoses(patientId) {
    const ds = await Dose.find({ patient_id: patientId, dose_date: day() }).sort({ scheduled_time: 1 }).lean();
    const rows = [];
    for (const d of ds) { const m = await Medicine.findOne({ _id: d.medicine_id, active: true }).lean(); if (m) rows.push({ ...shape(d), name: m.name, dosage: m.dosage, instructions: m.instructions }); }
    return { rows, rowCount: rows.length };
}
export async function doseHistory(patientId, days) {
    const start = new Date(); start.setDate(start.getDate() - days + 1); const startDate = start.toISOString().slice(0, 10);
    const ds = await Dose.find({ patient_id: patientId, dose_date: { $gte: startDate } }).sort({ dose_date: -1, scheduled_time: -1 }).lean();
    const rows = [];
    for (const d of ds) { const m = await Medicine.findById(d.medicine_id).lean(); rows.push({ ...shape(d), name: m?.name, dosage: m?.dosage }); }
    return { rows, rowCount: rows.length };
}
