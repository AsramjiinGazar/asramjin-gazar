import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authService } from '../services/authService.js';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const userId = req.user!.id;
  const { data: user } = await supabase.from('users').select('id, email, role').eq('id', userId).single();
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();

  if (!user || !profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    profile,
  });
}

export const authController = { register, login, me };
