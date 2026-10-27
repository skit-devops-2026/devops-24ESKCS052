import {z} from 'zod';
export const settingsSchema=z.object({body:z.object({name:z.string().trim().min(1).max(100).optional(),snooze_minutes:z.coerce.number().int().min(1).max(60).optional(),grace_minutes:z.coerce.number().int().min(10).max(240).optional()}).refine(v=>Object.keys(v).length>0)});
