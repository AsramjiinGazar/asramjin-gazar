import { z } from 'zod';

export const createBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(200).optional().nullable(),
  ruleType: z.string().max(50).optional().nullable(),
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
