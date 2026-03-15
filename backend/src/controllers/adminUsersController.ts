import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function getUsers(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = (page - 1) * limit;

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch users');

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const userIds = (users ?? []).map((u) => u.id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url, total_xp, level')
    .in('user_id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  const items = (users ?? []).map((u) => ({
    ...u,
    profile: profileMap.get(u.id) ?? null,
  }));

  res.json({
    data: items,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export const adminUsersController = { getUsers };
