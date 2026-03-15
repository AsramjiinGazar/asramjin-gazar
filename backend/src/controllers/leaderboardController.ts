import type { Request, Response } from 'express';
import { leaderboardService } from '../services/leaderboardService.js';

export async function getAllTime(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await leaderboardService.getAllTimeLeaderboard(page, limit);
  res.json(result);
}

export async function getMonthly(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await leaderboardService.getMonthlyLeaderboard(page, limit);
  res.json(result);
}

export const leaderboardController = { getAllTime, getMonthly };
