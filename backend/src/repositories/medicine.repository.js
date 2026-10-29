// import {query} from '../config/db.js';
// export const listMedicines=patientId=>query('SELECT * FROM medicines WHERE patient_id=$1 AND active=TRUE ORDER BY name',[patientId]);
// export const createMedicine=(p,v)=>query('INSERT INTO medicines(patient_id,name,dosage,instructions,times,stock,pills_per_dose) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[p,v.name,v.dosage,v.instructions,v.times,v.stock,v.pills_per_dose]);
// export const updateMedicine=(p,id,v)=>query('UPDATE medicines SET name=$3,dosage=$4,instructions=$5,times=$6,stock=$7,pills_per_dose=$8,updated_at=NOW() WHERE patient_id=$1 AND id=$2 AND active=TRUE RETURNING *',[p,id,v.name,v.dosage,v.instructions,v.times,v.stock,v.pills_per_dose]);
// export const archiveMedicine=(p,id)=>query('UPDATE medicines SET active=FALSE,updated_at=NOW() WHERE patient_id=$1 AND id=$2 AND active=TRUE RETURNING id',[p,id]);

import { Medicine } from '../models/index.js';
const shape = m => ({ ...m, id: String(m._id), patient_id: String(m.patient_id) });
export const listMedicines = async patientId => { const rows = (await Medicine.find({ patient_id: patientId, active: true }).sort({ name: 1 }).lean()).map(shape); return { rows, rowCount: rows.length }; };
export const createMedicine = async (p, v) => { const m = await Medicine.create({ patient_id: p, name: v.name, dosage: v.dosage, instructions: v.instructions, times: v.times, stock: v.stock, pills_per_dose: v.pills_per_dose }); return { rows: [shape(m.toObject())], rowCount: 1 }; };
export const updateMedicine = async (p, id, v) => { const m = await Medicine.findOneAndUpdate({ _id: id, patient_id: p, active: true }, { $set: { name: v.name, dosage: v.dosage, instructions: v.instructions, times: v.times, stock: v.stock, pills_per_dose: v.pills_per_dose } }, { new: true }).lean(); return { rows: m ? [shape(m)] : [], rowCount: m ? 1 : 0 }; };
export const archiveMedicine = async (p, id) => { const m = await Medicine.findOneAndUpdate({ _id: id, patient_id: p, active: true }, { $set: { active: false } }, { new: true }).lean(); return { rows: m ? [{ id: String(m._id) }] : [], rowCount: m ? 1 : 0 }; };
