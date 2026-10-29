// import {query} from '../config/db.js';
// export const listLinkedPatients=caregiverId=>query('SELECT u.id,u.name,u.email FROM caregiver_patient_links l JOIN users u ON u.id=l.patient_id WHERE l.caregiver_id=$1 ORDER BY u.name',[caregiverId]);
// export const isLinked=(patientId,caregiverId)=>query('SELECT 1 FROM caregiver_patient_links WHERE patient_id=$1 AND caregiver_id=$2',[patientId,caregiverId]);
// export const findPatient=id=>query("SELECT id,name,email FROM users WHERE id=$1 AND role='patient' AND is_active=TRUE",[id]);


import { CaregiverLink, User } from '../models/index.js';
export const listLinkedPatients = async caregiverId => { const links = await CaregiverLink.find({ caregiver_id: caregiverId }).lean(); const rows = []; for (const l of links) { const u = await User.findOne({ _id: l.patient_id, role: 'patient', is_active: true }).select('name email').lean(); if (u) rows.push({ id: String(u._id), name: u.name, email: u.email }); } rows.sort((a, b) => a.name.localeCompare(b.name)); return { rows, rowCount: rows.length }; };
export const isLinked = async (patientId, caregiverId) => { const found = await CaregiverLink.exists({ patient_id: patientId, caregiver_id: caregiverId }); return { rows: found ? [{}] : [], rowCount: found ? 1 : 0 }; };
export const findPatient = async id => { const u = await User.findOne({ _id: id, role: 'patient', is_active: true }).select('name email').lean(); return { rows: u ? [{ id: String(u._id), name: u.name, email: u.email }] : [], rowCount: u ? 1 : 0 }; };
