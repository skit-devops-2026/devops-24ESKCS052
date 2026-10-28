import * as repo from '../repositories/medicine.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const list = async id => (await repo.listMedicines(id)).rows;

export async function create(id, v) { return (await repo.createMedicine(id, v)).rows[0] }
export async function update(id, medicineId, v) {
    const r = await repo.updateMedicine(id, medicineId, v);
    if (!r.rowCount) throw new ApiError(404, 'Medicine not found.');
    return r.rows[0]
}
export async function archive(id, medicineId) {
    const r = await repo.archiveMedicine(id, medicineId);
    if (!r.rowCount) throw new ApiError(404, 'Medicine not found.');
    return { ok: true }
}
