import type { Request, Response } from 'express';
import { questsService } from '../services/questsService.js';

export async function getQuests(_req: Request, res: Response) {
  const quests = await questsService.getQuests();
  res.json(quests);
}

export async function getMyProgress(req: Request, res: Response) {
  const progress = await questsService.getMyQuestProgress(req.user!.id);
  res.json(progress);
}

export const questsController = { getQuests, getMyProgress };
