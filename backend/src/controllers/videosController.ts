import type { Request, Response } from 'express';
import { videosService } from '../services/videosService.js';

export async function createVideo(req: Request, res: Response) {
  const video = await videosService.createVideo(req.user!.id, req.body);
  res.status(201).json(video);
}

export async function getVideos(req: Request, res: Response) {
  const result = await videosService.getVideos(
    req.query as unknown as Parameters<typeof videosService.getVideos>[0]
  );
  res.json(result);
}

export async function getVideoById(req: Request, res: Response) {
  const video = await videosService.getVideoById(req.params.id);
  res.json(video);
}

export async function deleteVideo(req: Request, res: Response) {
  await videosService.deleteVideo(req.params.id);
  res.json({ success: true });
}

export const videosController = {
  createVideo,
  getVideos,
  getVideoById,
  deleteVideo,
};
