import {query} from '../config/db.js';
export const linkPatient=(patientId,caregiverId)=>query('INSERT INTO caregiver_patient_links(patient_id,caregiver_id) VALUES($1,$2) RETURNING id,patient_id,caregiver_id',[patientId,caregiverId]);
export const listCaregivers=patientId=>query('SELECT l.id AS link_id,u.id,u.name,u.email FROM caregiver_patient_links l JOIN users u ON u.id=l.caregiver_id WHERE l.patient_id=$1 ORDER BY u.name',[patientId]);
export const unlinkPatient=(patientId,caregiverId)=>query('DELETE FROM caregiver_patient_links WHERE patient_id=$1 AND caregiver_id=$2 RETURNING id',[patientId,caregiverId]);
