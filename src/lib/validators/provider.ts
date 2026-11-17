import { z } from 'zod';

export const providerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters').max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?92|0)?3\d{2}[\s-]?\d{7}$/,
      'Enter a valid Pakistan mobile number (e.g. 0300 1234567 or +923001234567).'
    ),
  headline: z.string().trim().min(3, 'Professional headline must be at least 3 characters').max(100),
  bio: z.string().trim().min(10, 'About your work must be at least 10 characters').max(1000),
  experienceYears: z.number().int().min(0).max(60),
  visitFee: z.number().int().positive().max(1000000),
  serviceSlugs: z.array(z.string().min(2)).min(1, 'Please select at least 1 service').max(12),
  areas: z.array(z.string().min(2)).min(1, 'Please select at least 1 coverage area').max(15),
  cnicLast4: z.string().regex(/^\d{4}$/, 'Enter 4 digits'),
  cnicFrontPath: z.string().min(1),
  cnicBackPath: z.string().min(1),
});
