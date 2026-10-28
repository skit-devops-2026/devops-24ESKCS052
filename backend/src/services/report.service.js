import { dailySummary, medicineSummary } from '../repositories/report.repository.js';
export async function report(id, days = 30) {
    const [daily, medicines] = await Promise.all([dailySummary(id, days), medicineSummary(id, days)]);
    return { patientId: Number(id), days, generatedAt: new Date().toISOString(), daily: daily.rows, medicines: medicines.rows }
}
