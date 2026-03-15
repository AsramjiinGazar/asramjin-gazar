import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateProfileInput, StudentsQueryInput } from '../validators/profileValidators.js';

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Profile not found');
  }
  return data;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.fullName !== undefined) updateData.full_name = input.fullName;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.hobbies !== undefined) updateData.hobbies = input.hobbies;
  if (input.favoriteSubject !== undefined) updateData.favorite_subject = input.favoriteSubject;
  if (input.birthday !== undefined) updateData.birthday = input.birthday;
  if (input.quote !== undefined) updateData.quote = input.quote;
  if (input.success !== undefined) updateData.success = input.success;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update profile');
  return data;
}

export async function getStudents(query: StudentsQueryInput) {
  const { page, limit, search, favoriteSubject, hobby, sort } = query;
  const offset = (page - 1) * limit;

  let q = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('user_id', 'user_id'); // placeholder - we need to join with users

  // Profiles don't have user_id filter for "all students" - we need all profiles
  q = supabase.from('profiles').select('*', { count: 'exact' });

  if (search) {
    q = q.ilike('full_name', `%${search}%`);
  }
  if (favoriteSubject) {
    q = q.eq('favorite_subject', favoriteSubject);
  }
  if (hobby) {
    q = q.contains('hobbies', [hobby]);
  }

  if (sort === 'xp') {
    q = q.order('total_xp', { ascending: false });
  } else {
    q = q.order('created_at', { ascending: false });
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch students');

  const profiles = data ?? [];
  const userIds = profiles.map((p) => (p as { user_id?: string }).user_id).filter(Boolean) as string[];
  const { data: userBadges, error: ubError } = await supabase
    .from('user_badges')
    .select('user_id, badge_id')
    .in('user_id', userIds);
  if (ubError) throw new AppError(500, 'Failed to fetch student badges');

  const badgeIds = [...new Set((userBadges ?? []).map((ub) => (ub as { badge_id: string }).badge_id))];
  const { data: badges, error: bError } = badgeIds.length
    ? await supabase.from('badges').select('id, name, icon').in('id', badgeIds)
    : { data: [], error: null };
  if (bError) throw new AppError(500, 'Failed to fetch badges');

  const badgeMap = new Map((badges ?? []).map((b) => [b.id, b]));
  const badgesByUser = new Map<string, Array<{ id: string; name: string; icon: string | null }>>();
  for (const ub of userBadges ?? []) {
    const u = (ub as { user_id: string }).user_id;
    const bid = (ub as { badge_id: string }).badge_id;
    const b = badgeMap.get(bid);
    if (!b) continue;
    const arr = badgesByUser.get(u) ?? [];
    arr.push({ id: b.id, name: b.name, icon: b.icon ?? null });
    badgesByUser.set(u, arr);
  }

  return {
    data: profiles.map((p) => ({
      ...p,
      badges: badgesByUser.get((p as { user_id: string }).user_id) ?? [],
    })),
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Student not found');
  }

  const userId = (data as { user_id?: string }).user_id;
  if (!userId) return data;

  const { data: userBadges, error: ubError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  if (ubError) throw new AppError(500, 'Failed to fetch student badges');

  const badgeIds = [...new Set((userBadges ?? []).map((ub) => (ub as { badge_id: string }).badge_id))];
  const { data: badges, error: bError } = badgeIds.length
    ? await supabase.from('badges').select('id, name, icon').in('id', badgeIds)
    : { data: [], error: null };
  if (bError) throw new AppError(500, 'Failed to fetch badges');

  return {
    ...data,
    badges: (badges ?? []).map((b) => ({ id: b.id, name: b.name, icon: b.icon ?? null })),
  };
}

export async function getStudentByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Student not found');
  }
  return data;
}

export const profileService = {
  getProfileByUserId,
  updateProfile,
  getStudents,
  getStudentById,
  getStudentByUserId,
};
