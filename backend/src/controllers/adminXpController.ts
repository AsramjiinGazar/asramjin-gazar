import type { Request, Response } from 'express';
import { awardXP } from '../services/xpService.js';
import { z } from 'zod';

const adjustXpSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(-1000).max(1000),
  reason: z.string().max(200).optional(),
});

export async function adjustXp(req: Request, res: Response) {
  const parsed = adjustXpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors });
  }

  const { userId, amount, reason } = parsed.data;
  if (amount === 0) {
    return res.status(400).json({ error: 'Amount must not be zero' });
  }

  await awardXP(userId, 'admin_adjustment', {
    xpReward: amount,
    referenceType: 'admin',
    referenceId: req.user!.id,
    metadata: reason ? { reason } : undefined,
  });

  res.json({ success: true, message: `XP adjusted by ${amount}` });
}

export const adminXpController = { adjustXp };
