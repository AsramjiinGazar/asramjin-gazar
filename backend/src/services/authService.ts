import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterInput, LoginInput } from '../validators/authValidators.js';
import type { JwtPayload } from '../types/index.js';

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput) {
  const { data: existing } = await supabase.from('users').select('id').eq('email', input.email).single();
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: input.email,
      password_hash: passwordHash,
      role: 'student',
    })
    .select()
    .single();

  if (userError || !user) {
    throw new AppError(500, 'Failed to create user');
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: user.id,
    full_name: input.fullName,
    avatar_url: input.avatar ?? null,
  });

  if (profileError) {
    await supabase.from('users').delete().eq('id', user.id);
    throw new AppError(500, 'Failed to create profile');
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
    profile,
  };
}

export async function login(input: LoginInput) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, role, password_hash')
    .eq('email', input.email)
    .single();

  if (userError || !user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', user.id);

  const { checkAndUpdateProgress } = await import('./questsService.js');
  await checkAndUpdateProgress(user.id, 'login_daily');
  await import('./xpService.js').then((m) => m.awardXP(user.id, 'daily_login'));
  const { checkAndAwardBadges } = await import('./badgesService.js');
  await checkAndAwardBadges(user.id);

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
    profile,
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export const authService = { register, login, signToken, verifyToken };
