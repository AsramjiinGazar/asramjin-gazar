import { supabase } from '../db/supabase.js';
import { XP_AMOUNTS, XP_LIMITS } from '../config/constants.js';
import { calculateLevel } from '../utils/levelUtils.js';
import { startOfDay, subMinutes } from 'date-fns';

export interface AwardXPMetadata {
  questId?: string;
  xpReward?: number;
  referenceType?: string;
  referenceId?: string;
  reactorId?: string;
  metadata?: Record<string, unknown>;
}

export async function awardXP(
  userId: string,
  actionType: string,
  metadata: AwardXPMetadata = {}
): Promise<number> {
  let xpAmount: number;
  if (actionType === 'quest_completed' && metadata.xpReward !== undefined) {
    xpAmount = metadata.xpReward;
  } else if (actionType === 'admin_adjustment' && metadata.xpReward !== undefined) {
    xpAmount = metadata.xpReward;
  } else {
    xpAmount = metadata.xpReward ?? XP_AMOUNTS[actionType] ?? 0;
  }
  if (xpAmount === 0) return 0;
  if (xpAmount < 0 && actionType !== 'admin_adjustment') return 0;

  if (actionType !== 'admin_adjustment' && (await shouldSkipXP(userId, actionType, metadata))) return 0;

  const refId = metadata.referenceId ?? (actionType === 'quest_completed' ? metadata.questId : null);
  const { data: log, error: logError } = await supabase
    .from('xp_logs')
    .insert({
      user_id: userId,
      action_type: actionType,
      xp_amount: xpAmount,
      reference_type: metadata.referenceType ?? (actionType === 'quest_completed' ? 'quest' : null),
      reference_id: refId,
      metadata: metadata as object,
    })
    .select()
    .single();

  if (logError || !log) return 0;

  const { data: profile } = await supabase.from('profiles').select('total_xp').eq('user_id', userId).single();
  const newTotal = Math.max(0, (profile?.total_xp ?? 0) + xpAmount);
  const newLevel = calculateLevel(newTotal);

  await supabase
    .from('profiles')
    .update({ total_xp: newTotal, level: newLevel })
    .eq('user_id', userId);

  return xpAmount;
}

async function shouldSkipXP(
  userId: string,
  actionType: string,
  metadata: AwardXPMetadata
): Promise<boolean> {
  const now = new Date();

  if (actionType === 'daily_login') {
    const todayStart = startOfDay(now).toISOString();
    const { data } = await supabase
      .from('xp_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'daily_login')
      .gte('created_at', todayStart)
      .limit(1);
    if (data && data.length > 0) return true;
  }

  if (actionType === 'comment_created') {
    const todayStart = startOfDay(now).toISOString();
    const { data: todayComments } = await supabase
      .from('xp_logs')
      .select('xp_amount')
      .eq('user_id', userId)
      .eq('action_type', 'comment_created')
      .gte('created_at', todayStart);
    const total = (todayComments ?? []).reduce((s, r) => s + (r.xp_amount ?? 0), 0);
    if (total >= XP_LIMITS.comment_daily_cap) return true;

    const cooldown = subMinutes(now, XP_LIMITS.comment_cooldown_minutes).toISOString();
    const { data: recent } = await supabase
      .from('xp_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'comment_created')
      .gte('created_at', cooldown)
      .limit(1);
    if (recent && recent.length > 0) return true;
  }

  if (actionType === 'post_created') {
    const cooldown = subMinutes(now, XP_LIMITS.post_cooldown_minutes).toISOString();
    const { data: recent } = await supabase
      .from('xp_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'post_created')
      .gte('created_at', cooldown)
      .limit(1);
    if (recent && recent.length > 0) return true;
  }

  if (actionType === 'gallery_upload') {
    const cooldown = subMinutes(now, XP_LIMITS.gallery_cooldown_minutes).toISOString();
    const { data: recent } = await supabase
      .from('xp_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'gallery_upload')
      .gte('created_at', cooldown)
      .limit(1);
    if (recent && recent.length > 0) return true;
  }

  if (actionType === 'quest_completed' && metadata.questId) {
    const { data: existing } = await supabase
      .from('xp_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', 'quest_completed')
      .eq('reference_id', metadata.questId)
      .limit(1);
    if (existing && existing.length > 0) return true;
  }

  if (actionType === 'receive_reactions' && metadata.reactorId) {
    if (metadata.reactorId === userId) return true;
  }

  return false;
}
