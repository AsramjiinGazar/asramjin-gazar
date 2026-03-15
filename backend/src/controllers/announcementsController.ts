import type { Request, Response } from 'express';
import { announcementsService } from '../services/announcementsService.js';

export async function getAnnouncements(_req: Request, res: Response) {
  const announcements = await announcementsService.getAnnouncements();
  res.json(announcements);
}

export async function createAnnouncement(req: Request, res: Response) {
  const announcement = await announcementsService.createAnnouncement(req.user!.id, req.body);
  res.status(201).json(announcement);
}

export async function updateAnnouncement(req: Request, res: Response) {
  const announcement = await announcementsService.updateAnnouncement(req.params.id, req.body);
  res.json(announcement);
}

export async function deleteAnnouncement(req: Request, res: Response) {
  await announcementsService.deleteAnnouncement(req.params.id);
  res.json({ success: true });
}

export const announcementsController = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
