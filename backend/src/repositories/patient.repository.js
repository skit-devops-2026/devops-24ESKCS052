import {query} from '../config/db.js';
export const listLinkedPatients=caregiverId=>query('SELECT u.id,u.name,u.email FROM caregiver_patient_links l JOIN users u ON u.id=l.patient_id WHERE l.caregiver_id=$1 ORDER BY u.name',[caregiverId]);
export const isLinked=(patientId,caregiverId)=>query('SELECT 1 FROM caregiver_patient_links WHERE patient_id=$1 AND caregiver_id=$2',[patientId,caregiverId]);
export const findPatient=id=>query("SELECT id,name,email FROM users WHERE id=$1 AND role='patient' AND is_active=TRUE",[id]);
