import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  youtubeUrl: z.string().url(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  youtubeUrl: z.string().url().optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
});

export const videosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type VideosQueryInput = z.infer<typeof videosQuerySchema>;
