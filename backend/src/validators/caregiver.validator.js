import {z} from 'zod';
export const linkSchema=z.object({body:z.object({code:z.string().trim().min(1).max(20)})});
