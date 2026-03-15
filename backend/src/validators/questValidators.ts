import { z } from 'zod';

const actionTypes = [
  'post_created',
  'comment_created',
  'gallery_upload',
  'poll_vote',
  'login_daily',
  'receive_reactions',
  'manual',
] as const;

export const createQuestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['daily', 'weekly', 'special']),
  xpReward: z.number().int().min(1),
  targetCount: z.number().int().min(1).default(1),
  actionType: z.enum(actionTypes).default('manual'),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateQuestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['daily', 'weekly', 'special']).optional(),
  xpReward: z.number().int().min(1).optional(),
  targetCount: z.number().int().min(1).optional(),
  actionType: z.enum(actionTypes).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;
