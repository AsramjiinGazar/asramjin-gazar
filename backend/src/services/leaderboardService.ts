import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function getAllTimeLeaderboard(page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, total_xp, level', { count: 'exact' })
    .order('total_xp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch leaderboard');

  const items = (data ?? []).map((p, i) => ({
    rank: offset + i + 1,
    userId: p.user_id,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    totalXP: p.total_xp,
    level: p.level,
  }));

  return {
    data: items,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getMonthlyLeaderboard(page = 1, limit = 20) {
  // Use UTC month start since `created_at` is stored as UTC timestamp in Supabase.
  const now = new Date();
  const monthStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthStart = monthStartUtc.toISOString();

  const { data: logs, error: logsError } = await supabase
    .from('xp_logs')
    .select('user_id, xp_amount')
    .gte('created_at', monthStart)
    .gt('xp_amount', 0);
  if (logsError) throw new AppError(500, 'Failed to fetch monthly XP logs');

  const userXp = new Map<string, number>();
  for (const log of logs ?? []) {
    const current = userXp.get(log.user_id) ?? 0;
    userXp.set(log.user_id, current + (log.xp_amount ?? 0));
  }

  const { data: profiles, error: profilesError, count } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url, level', { count: 'exact' });
  if (profilesError) throw new AppError(500, 'Failed to fetch profiles');

  const rows = (profiles ?? []).map((p) => ({
    userId: p.user_id,
    fullName: p.full_name ?? 'Unknown',
    avatarUrl: p.avatar_url ?? null,
    level: p.level ?? 1,
    monthXP: userXp.get(p.user_id) ?? 0,
  }));

  rows.sort((a, b) => {
    if (b.monthXP !== a.monthXP) return b.monthXP - a.monthXP;
    return a.fullName.localeCompare(b.fullName);
  });

  const total = count ?? rows.length;
  const offset = (page - 1) * limit;
  const items = rows.slice(offset, offset + limit).map((r, i) => ({
    rank: offset + i + 1,
    userId: r.userId,
    fullName: r.fullName,
    avatarUrl: r.avatarUrl,
    totalXP: r.monthXP,
    level: r.level,
  }));

  return {
    data: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export const leaderboardService = {
  getAllTimeLeaderboard,
  getMonthlyLeaderboard,
};
