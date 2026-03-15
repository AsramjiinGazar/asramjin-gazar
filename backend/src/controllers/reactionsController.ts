import type { Request, Response } from 'express';
import { reactionsService } from '../services/reactionsService.js';

export async function addReaction(req: Request, res: Response) {
  const reaction = await reactionsService.addReaction(
    req.params.postId,
    req.user!.id,
    req.body
  );
  res.status(201).json(reaction);
}

export async function removeReaction(req: Request, res: Response) {
  await reactionsService.removeReaction(req.params.postId, req.user!.id);
  res.json({ success: true });
}

export const reactionsController = { addReaction, removeReaction };
