import { z } from 'zod';

const categories = ['trips', 'school-life', 'events', 'memes', 'projects'] as const;

export const createGalleryItemSchema = z.object({
  imageUrl: z.string().url(),
  cloudinaryPublicId: z.string().min(1),
  caption: z.string().max(500).optional().nullable(),
  category: z.enum(categories).optional().nullable(),
});

export const galleryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(categories).optional(),
  mine: z
    .preprocess((v) => v === 'true' || v === '1', z.boolean())
    .optional()
    .default(false),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type GalleryQueryInput = z.infer<typeof galleryQuerySchema>;
