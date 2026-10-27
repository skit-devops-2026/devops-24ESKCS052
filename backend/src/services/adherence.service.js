import {dailySummary} from '../repositories/report.repository.js';
export async function summary(patientId,days=30){const rows=(await dailySummary(patientId,days)).rows;const total=rows.reduce((n,r)=>n+r.taken+r.missed+r.skipped,0);const taken=rows.reduce((n,r)=>n+r.taken,0);return {adherence:total?Math.round(taken/total*100):0,total,taken,missed:rows.reduce((n,r)=>n+r.missed,0),daily:rows}}
