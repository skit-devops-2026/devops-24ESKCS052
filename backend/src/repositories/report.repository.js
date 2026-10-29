// import {query} from '../config/db.js';
// export const dailySummary=(id,days)=>query(`SELECT dose_date::text AS date,COUNT(*) FILTER(WHERE status='taken')::int AS taken,COUNT(*) FILTER(WHERE status='missed')::int AS missed,COUNT(*) FILTER(WHERE status='skipped')::int AS skipped,COUNT(*) FILTER(WHERE status IN('pending','snoozed'))::int AS pending,COUNT(*)::int AS total FROM doses WHERE patient_id=$1 AND dose_date>=CURRENT_DATE-($2::int-1) GROUP BY dose_date ORDER BY dose_date`,[id,days]);
// export const medicineSummary=(id,days)=>query(`SELECT m.id,m.name,COUNT(*) FILTER(WHERE d.status='taken')::int AS taken,COUNT(*) FILTER(WHERE d.status='missed')::int AS missed,COUNT(*) FILTER(WHERE d.status='skipped')::int AS skipped FROM medicines m LEFT JOIN doses d ON d.medicine_id=m.id AND d.dose_date>=CURRENT_DATE-($2::int-1) WHERE m.patient_id=$1 GROUP BY m.id ORDER BY m.name`,[id,days]);


import { Dose, Medicine } from '../models/index.js';
const dateDaysAgo = days => { const d = new Date(); d.setDate(d.getDate() - days + 1); return d.toISOString().slice(0, 10) };
export async function dailySummary(id, days) {
    const ds = await Dose.find({ patient_id: id, dose_date: { $gte: dateDaysAgo(days) } }).lean(); const map = new Map();
    for (const d of ds) { const x = map.get(d.dose_date) || { date: d.dose_date, taken: 0, missed: 0, skipped: 0, pending: 0, total: 0 }; x.total++; if (['taken', 'missed', 'skipped'].includes(d.status)) x[d.status]++; else x.pending++; map.set(d.dose_date, x) }
    const rows = [...map.values()].sort((a, b) => a.date.localeCompare(b.date)); return { rows, rowCount: rows.length };
}
export async function medicineSummary(id, days) {
    const ms = await Medicine.find({ patient_id: id }).sort({ name: 1 }).lean(); const rows = [];
    for (const m of ms) { const ds = await Dose.find({ medicine_id: m._id, dose_date: { $gte: dateDaysAgo(days) } }).lean(); const x = { id: String(m._id), name: m.name, taken: 0, missed: 0, skipped: 0 }; for (const d of ds) if (['taken', 'missed', 'skipped'].includes(d.status)) x[d.status]++; rows.push(x) }
    return { rows, rowCount: rows.length };
}
