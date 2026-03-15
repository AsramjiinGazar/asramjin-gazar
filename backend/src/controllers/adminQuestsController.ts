import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import type { CreateQuestInput, UpdateQuestInput } from '../validators/questValidators.js';
import { awardXP } from '../services/xpService.js';
import { z } from 'zod';

const awardQuestXpSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});

export async function createQuest(req: Request, res: Response) {
  const input = req.body as CreateQuestInput;
  const { data, error } = await supabase
    .from('quests')
    .insert({
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      xp_reward: input.xpReward,
      target_count: input.targetCount,
      action_type: input.actionType,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      is_active: true,
      created_by: req.user!.id,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create quest');
  res.status(201).json(data);
}

export async function awardQuestXp(req: Request, res: Response) {
  const questIdParsed = z.string().uuid().safeParse(req.params.id);
  if (!questIdParsed.success) {
    return res.status(400).json({ error: 'Invalid quest id' });
  }
  const parsed = awardQuestXpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors });
  }

  const questId = questIdParsed.data;
  const { userIds } = parsed.data;

  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('id, xp_reward, target_count')
    .eq('id', questId)
    .single();

  if (questError || !quest) throw new AppError(404, 'Quest not found');

  const targetCount = Math.max(1, Number(quest.target_count ?? 1));
  const xpReward = Number(quest.xp_reward ?? 0);
  const now = new Date().toISOString();

  let awardedCount = 0;
  let skippedCount = 0;

  for (const userId of userIds) {
    const { data: existing, error: existsError } = await supabase
      .from('quest_progress')
      .select('id')
      .eq('quest_id', questId)
      .eq('user_id', userId)
      .limit(1);
    if (existsError) throw new AppError(500, 'Failed to check quest progress');

    if (existing && existing.length > 0) {
      const { error: updErr } = await supabase
        .from('quest_progress')
        .update({
          progress: targetCount,
          is_completed: true,
          completed_at: now,
        })
        .eq('id', existing[0].id);
      if (updErr) throw new AppError(500, 'Failed to update quest progress');
    } else {
      const { error: insErr } = await supabase.from('quest_progress').insert({
        quest_id: questId,
        user_id: userId,
        progress: targetCount,
        is_completed: true,
        completed_at: now,
      });
      if (insErr) throw new AppError(500, 'Failed to insert quest progress');
    }

    const awarded = await awardXP(userId, 'quest_completed', {
      questId,
      xpReward,
      referenceType: 'quest',
      referenceId: questId,
      metadata: { awardedBy: req.user!.id },
    });

    if (awarded > 0) awardedCount += 1;
    else skippedCount += 1;
  }

  res.json({ success: true, awardedCount, skippedCount });
}

export async function updateQuest(req: Request, res: Response) {
  const input = req.body as UpdateQuestInput;
  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.xpReward !== undefined) updateData.xp_reward = input.xpReward;
  if (input.targetCount !== undefined) updateData.target_count = input.targetCount;
  if (input.actionType !== undefined) updateData.action_type = input.actionType;
  if (input.startDate !== undefined) updateData.start_date = input.startDate;
  if (input.endDate !== undefined) updateData.end_date = input.endDate;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabase
    .from('quests')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update quest');
  res.json(data);
}

export async function deleteQuest(req: Request, res: Response) {
  const { error } = await supabase.from('quests').delete().eq('id', req.params.id);
  if (error) throw new AppError(500, 'Failed to delete quest');
  res.json({ success: true });
}

export const adminQuestsController = {
  createQuest,
  awardQuestXp,
  updateQuest,
  deleteQuest,
};
