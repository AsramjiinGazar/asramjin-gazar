import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional().nullable(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['active', 'hidden', 'flagged']).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const createReactionSchema = z.object({
  type: z.enum(['like', 'fire', 'laugh', 'heart', 'clap']),
});

export const postsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateReactionInput = z.infer<typeof createReactionSchema>;
export type PostsQueryInput = z.infer<typeof postsQuerySchema>;
