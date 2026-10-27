import {query} from '../config/db.js';
export const listMedicines=patientId=>query('SELECT * FROM medicines WHERE patient_id=$1 AND active=TRUE ORDER BY name',[patientId]);
export const createMedicine=(p,v)=>query('INSERT INTO medicines(patient_id,name,dosage,instructions,times,stock,pills_per_dose) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[p,v.name,v.dosage,v.instructions,v.times,v.stock,v.pills_per_dose]);
export const updateMedicine=(p,id,v)=>query('UPDATE medicines SET name=$3,dosage=$4,instructions=$5,times=$6,stock=$7,pills_per_dose=$8,updated_at=NOW() WHERE patient_id=$1 AND id=$2 AND active=TRUE RETURNING *',[p,id,v.name,v.dosage,v.instructions,v.times,v.stock,v.pills_per_dose]);
export const archiveMedicine=(p,id)=>query('UPDATE medicines SET active=FALSE,updated_at=NOW() WHERE patient_id=$1 AND id=$2 AND active=TRUE RETURNING id',[p,id]);
