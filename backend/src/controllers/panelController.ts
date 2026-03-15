import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { announcementsService } from '../services/announcementsService.js';
import { AppError } from '../utils/AppError.js';
import { awardXP } from '../services/xpService.js';
import { badgesService } from '../services/badgesService.js';
import type { CreateQuestInput } from '../validators/questValidators.js';
import type { CreateAnnouncementInput } from '../validators/announcementValidators.js';
import type { CreateBadgeInput } from '../validators/badgeValidators.js';
import { z } from 'zod';

const awardQuestXpSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});

const awardBadgesSchema = z.object({
  badgeId: z.string().uuid(),
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
      created_by: null,
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
      metadata: { via: 'panel' },
    });

    if (awarded > 0) awardedCount += 1;
    else skippedCount += 1;
  }

  res.json({ success: true, awardedCount, skippedCount });
}

export async function createAnnouncement(req: Request, res: Response) {
  const announcement = await announcementsService.createAnnouncement(null, req.body as CreateAnnouncementInput);
  res.status(201).json(announcement);
}

export async function listBadges(_req: Request, res: Response) {
  const badges = await badgesService.getBadges();
  res.json(badges);
}

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

export async function awardBadges(req: Request, res: Response) {
  const parsed = awardBadgesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors });
  }

  const { badgeId, userIds } = parsed.data;

  let awardedCount = 0;
  let skippedCount = 0;

  for (const userId of userIds) {
    try {
      await badgesService.awardBadgeToUser(userId, badgeId);
      awardedCount += 1;
    } catch (e) {
      // Ignore duplicates (user already has badge); surface other errors
      if (e instanceof AppError && e.statusCode === 409) {
        skippedCount += 1;
        continue;
      }
      throw e;
    }
  }

  res.json({ success: true, awardedCount, skippedCount });
}

export const panelController = {
  createQuest,
  awardQuestXp,
  createAnnouncement,
  listBadges,
  createBadge,
  awardBadges,
};
