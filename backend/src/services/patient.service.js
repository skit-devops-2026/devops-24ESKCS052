import * as repo from '../repositories/patient.repository.js'; import * as caregiverRepo from '../repositories/caregiver.repository.js'; import { ApiError } from '../utils/ApiError.js';
export async function assertPatientAccess(user, patientId) { if (user.role === 'patient' && String(user.id) === String(patientId)) return true; if (user.role === 'caregiver') { const r = await repo.isLinked(patientId, user.id); if (r.rowCount) return true } throw new ApiError(403, 'You do not have access to this patient.') }
export async function getPatient(patientId) { const r = await repo.findPatient(patientId); if (!r.rowCount) throw new ApiError(404, 'Patient not found.'); return r.rows[0] }
// Return an array of linked patients instead of the raw PostgreSQL query result.
export const linkedPatients = async (caregiverId) => {
    const result = await repo.listLinkedPatients(caregiverId);
    return result.rows;
};
