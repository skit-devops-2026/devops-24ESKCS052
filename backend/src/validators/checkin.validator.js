import {z} from 'zod';
export const checkinSchema=z.object({body:z.object({mood:z.coerce.number().int().min(1).max(5),note:z.string().max(200).optional().default('')})});
