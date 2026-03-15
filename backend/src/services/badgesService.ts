import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  const ownedBadgeIds = new Set((userBadges ?? []).map((ub) => ub.badge_id));

  const { data: badges } = await supabase.from('badges').select('*');
  if (!badges?.length) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, streak_count')
    .eq('user_id', userId)
    .single();

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false);

  const { count: questCount } = await supabase
    .from('quest_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);

  const { count: galleryCount } = await supabase
    .from('gallery_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('category', 'memes');

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false);

  for (const badge of badges) {
    if (ownedBadgeIds.has(badge.id)) continue;

    let shouldAward = false;
    switch (badge.rule_type) {
      case 'first_post':
        shouldAward = (postCount ?? 0) >= 1;
        break;
      case 'quest_starter':
        shouldAward = (questCount ?? 0) >= 1;
        break;
      case 'meme_lord':
        shouldAward = (galleryCount ?? 0) >= 5;
        break;
      case 'helpful_friend':
        shouldAward = (commentCount ?? 0) >= 10;
        break;
      case 'streak_7':
        shouldAward = (profile?.streak_count ?? 0) >= 7;
        break;
      case 'class_legend':
        shouldAward = (profile?.total_xp ?? 0) >= 1000;
        break;
      default:
        break;
    }

    if (shouldAward) {
      await supabase.from('user_badges').insert({ user_id: userId, badge_id: badge.id });
    }
  }
}

export async function getBadges() {
  const { data, error } = await supabase.from('badges').select('*').order('name');
  if (error) throw new AppError(500, 'Failed to fetch badges');
  return data ?? [];
}

export async function getMyBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) throw new AppError(500, 'Failed to fetch badges');

  const items = data ?? [];
  const badgeIds = items.map((ub) => (ub as { badge_id: string }).badge_id);
  const { data: badges } = await supabase.from('badges').select('*').in('id', badgeIds);
  const badgeMap = new Map((badges ?? []).map((b) => [b.id, b]));

  return items.map((ub) => ({
    ...ub,
    badge: badgeMap.get((ub as { badge_id: string }).badge_id) ?? null,
  }));
}

export async function awardBadgeToUser(userId: string, badgeId: string) {
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) throw new AppError(409, 'User already has this badge');

  const { data, error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to award badge');
  return data;
}

export const badgesService = {
  checkAndAwardBadges,
  getBadges,
  getMyBadges,
  awardBadgeToUser,
};
