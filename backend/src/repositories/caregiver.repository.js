// import {query} from '../config/db.js';
// export const linkPatient=(patientId,caregiverId)=>query('INSERT INTO caregiver_patient_links(patient_id,caregiver_id) VALUES($1,$2) RETURNING id,patient_id,caregiver_id',[patientId,caregiverId]);
// export const listCaregivers=patientId=>query('SELECT l.id AS link_id,u.id,u.name,u.email FROM caregiver_patient_links l JOIN users u ON u.id=l.caregiver_id WHERE l.patient_id=$1 ORDER BY u.name',[patientId]);
// export const unlinkPatient=(patientId,caregiverId)=>query('DELETE FROM caregiver_patient_links WHERE patient_id=$1 AND caregiver_id=$2 RETURNING id',[patientId,caregiverId]);


import { CaregiverLink, User } from '../models/index.js';
export const linkPatient = async (patientId, caregiverId) => { const x = await CaregiverLink.create({ patient_id: patientId, caregiver_id: caregiverId }); return { rows: [{ id: String(x._id), patient_id: String(patientId), caregiver_id: String(caregiverId) }], rowCount: 1 }; };
export const listCaregivers = async patientId => { const links = await CaregiverLink.find({ patient_id: patientId }).lean(); const rows = []; for (const l of links) { const u = await User.findById(l.caregiver_id).select('name email').lean(); if (u) rows.push({ link_id: String(l._id), id: String(u._id), name: u.name, email: u.email }); } rows.sort((a, b) => a.name.localeCompare(b.name)); return { rows, rowCount: rows.length }; };
export const unlinkPatient = async (patientId, caregiverId) => { const r = await CaregiverLink.deleteOne({ patient_id: patientId, caregiver_id: caregiverId }); return { rows: r.deletedCount ? [{ id: 'deleted' }] : [], rowCount: r.deletedCount }; };
