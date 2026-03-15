import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { awardXP } from './xpService.js';

const ACTION_MAP: Record<string, string> = {
  post_created: 'post_created',
  comment_created: 'comment_created',
  gallery_upload: 'gallery_upload',
  poll_vote: 'poll_vote',
  login_daily: 'login_daily',
  receive_reactions: 'receive_reactions',
};

export async function checkAndUpdateProgress(userId: string, actionType: string): Promise<void> {
  const mappedAction = ACTION_MAP[actionType] ?? actionType;

  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('action_type', mappedAction)
    .eq('is_active', true);

  if (!quests?.length) return;

  for (const quest of quests) {
    const { data: progress } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('quest_id', quest.id)
      .eq('user_id', userId)
      .single();

    if (progress?.is_completed) continue;

    const newProgress = (progress?.progress ?? 0) + 1;
    const isComplete = newProgress >= quest.target_count;

    if (progress) {
      await supabase
        .from('quest_progress')
        .update({
          progress: newProgress,
          is_completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
        })
        .eq('id', progress.id);
    } else {
      await supabase.from('quest_progress').insert({
        quest_id: quest.id,
        user_id: userId,
        progress: newProgress,
        is_completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      });
    }

    if (isComplete) {
      await awardXP(userId, 'quest_completed', {
        questId: quest.id,
        xpReward: quest.xp_reward,
        referenceType: 'quest',
        referenceId: quest.id,
      });
      const { checkAndAwardBadges } = await import('./badgesService.js');
      await checkAndAwardBadges(userId);
    }
  }
}

export async function getQuests() {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(500, 'Failed to fetch quests');
  return data ?? [];
}

export async function getMyQuestProgress(userId: string) {
  const { data: progress, error } = await supabase
    .from('quest_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new AppError(500, 'Failed to fetch quest progress');

  const questIds = [...new Set((progress ?? []).map((p) => p.quest_id))];
  const { data: quests } = await supabase.from('quests').select('*').in('id', questIds);
  const questMap = new Map((quests ?? []).map((q) => [q.id, q]));

  return (progress ?? []).map((p) => ({
    ...p,
    quest: questMap.get(p.quest_id) ?? null,
  }));
}

export const questsService = {
  checkAndUpdateProgress,
  getQuests,
  getMyQuestProgress,
};
