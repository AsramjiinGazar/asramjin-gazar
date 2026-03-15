import type { Request, Response } from 'express';
import { badgesService } from '../services/badgesService.js';

export async function getBadges(_req: Request, res: Response) {
  const badges = await badgesService.getBadges();
  res.json(badges);
}

export async function getMyBadges(req: Request, res: Response) {
  const badges = await badgesService.getMyBadges(req.user!.id);
  res.json(badges);
}

export const badgesController = { getBadges, getMyBadges };
