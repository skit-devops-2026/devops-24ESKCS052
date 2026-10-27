import {z} from 'zod';
export const signupSchema=z.object({body:z.object({name:z.string().trim().min(1).max(100),email:z.string().email().max(254),password:z.string().min(8).max(128),role:z.enum(['patient','caregiver'])})});
export const loginSchema=z.object({body:z.object({email:z.string().email(),password:z.string().min(1).max(128)})});
