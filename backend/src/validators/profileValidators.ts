import { z } from 'zod';

const galleryCategories = ['trips', 'school-life', 'events', 'memes', 'projects'] as const;

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  hobbies: z.array(z.string()).optional(),
  favoriteSubject: z.string().max(100).optional().nullable(),
  birthday: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()]).optional().nullable(),
  quote: z.string().max(200).optional().nullable(),
  success: z.string().max(1000).optional().nullable(),
});

export const studentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
  favoriteSubject: z.string().optional(),
  hobby: z.string().optional(),
  sort: z.enum(['newest', 'xp']).default('newest'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type StudentsQueryInput = z.infer<typeof studentsQuerySchema>;
