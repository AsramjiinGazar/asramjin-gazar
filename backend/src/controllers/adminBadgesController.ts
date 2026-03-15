import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { badgesService } from '../services/badgesService.js';
import type { CreateBadgeInput } from '../validators/badgeValidators.js';

export async function createBadge(req: Request, res: Response) {
  const input = req.body as CreateBadgeInput;
  const { data, error } = await supabase
    .from('badges')
    .insert({
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      rule_type: input.ruleType ?? null,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create badge');
  res.status(201).json(data);
}

export async function awardBadgeToUser(req: Request, res: Response) {
  const { badgeId } = req.body as { badgeId: string };
  if (!badgeId) throw new AppError(400, 'badgeId is required');
  const result = await badgesService.awardBadgeToUser(req.params.id, badgeId);
  res.status(201).json(result);
}

export const adminBadgesController = {
  createBadge,
  awardBadgeToUser,
};
