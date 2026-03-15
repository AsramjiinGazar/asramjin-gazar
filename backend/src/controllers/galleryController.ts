import type { Request, Response } from 'express';
import { galleryService } from '../services/galleryService.js';

export async function upload(req: Request, res: Response) {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const caption = (req.body.caption as string) || undefined;
  const category = (req.body.category as string) || undefined;
  const item = await galleryService.uploadGalleryItem(
    req.user!.id,
    file,
    caption,
    category
  );
  res.status(201).json(item);
}

export async function getGallery(req: Request, res: Response) {
  type GalleryQuery = Parameters<typeof galleryService.getGalleryItems>[0];
  type GalleryQueryWithUser = GalleryQuery & { userId?: string };

  const q = req.query as unknown as GalleryQuery;
  const { mine = false } = q as unknown as { mine?: boolean };

  const query: GalleryQueryWithUser = mine ? ({ ...(q as object), userId: req.user!.id } as unknown as GalleryQueryWithUser) : q;
  const result = await galleryService.getGalleryItems(query as unknown as GalleryQuery);
  res.json(result);
}

export async function getGalleryItemById(req: Request, res: Response) {
  const item = await galleryService.getGalleryItemById(req.params.id);
  res.json(item);
}

export async function deleteGalleryItem(req: Request, res: Response) {
  await galleryService.deleteGalleryItem(req.params.id, req.user!.id, req.user!.role);
  res.json({ success: true });
}

export const galleryController = {
  upload,
  getGallery,
  getGalleryItemById,
  deleteGalleryItem,
};
