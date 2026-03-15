import type { Request, Response } from 'express';
import { postsService } from '../services/postsService.js';

export async function createPost(req: Request, res: Response) {
  const post = await postsService.createPost(req.user!.id, req.body);
  res.status(201).json(post);
}

export async function getPosts(req: Request, res: Response) {
  const result = await postsService.getPosts(req.query as unknown as Parameters<typeof postsService.getPosts>[0]);
  res.json(result);
}

export async function getPostById(req: Request, res: Response) {
  const post = await postsService.getPostById(req.params.id);
  res.json(post);
}

export async function updatePost(req: Request, res: Response) {
  const post = await postsService.updatePost(
    req.params.id,
    req.user!.id,
    req.user!.role,
    req.body
  );
  res.json(post);
}

export async function deletePost(req: Request, res: Response) {
  await postsService.deletePost(req.params.id, req.user!.id, req.user!.role);
  res.json({ success: true });
}

export const postsController = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
