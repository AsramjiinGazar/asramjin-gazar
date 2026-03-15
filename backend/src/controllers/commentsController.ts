import type { Request, Response } from 'express';
import { commentsService } from '../services/commentsService.js';

export async function createComment(req: Request, res: Response) {
  const comment = await commentsService.createComment(
    req.params.postId,
    req.user!.id,
    req.body
  );
  res.status(201).json(comment);
}

export async function getComments(req: Request, res: Response) {
  const comments = await commentsService.getComments(req.params.postId);
  res.json(comments);
}

export async function updateComment(req: Request, res: Response) {
  const comment = await commentsService.updateComment(
    req.params.id,
    req.user!.id,
    req.user!.role,
    req.body.content
  );
  res.json(comment);
}

export async function deleteComment(req: Request, res: Response) {
  await commentsService.deleteComment(req.params.id, req.user!.id, req.user!.role);
  res.json({ success: true });
}

export const commentsController = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
