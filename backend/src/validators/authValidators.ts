import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .refine((p) => /[A-Z]/.test(p), 'Password must contain at least one uppercase letter')
    .refine((p) => /[a-z]/.test(p), 'Password must contain at least one lowercase letter')
    .refine((p) => /\d/.test(p), 'Password must contain at least one number'),
  avatar: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
