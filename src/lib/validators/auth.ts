import { z } from 'zod';
export const signInSchema=z.object({email:z.string().trim().email().max(255),password:z.string().min(8).max(128),next:z.string().max(512).optional()});
export const signUpSchema=z.object({fullName:z.string().trim().min(2).max(100),email:z.string().trim().email().max(255),password:z.string().min(8).max(128),role:z.enum(['user','provider']).default('user')});
