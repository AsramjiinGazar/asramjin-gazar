import type { Request, Response } from 'express';
import { profileService } from '../services/profileService.js';
import { uploadImage, isCloudinaryConfigured } from '../services/cloudinaryService.js';

export async function getMyProfile(req: Request, res: Response) {
  const profile = await profileService.getProfileByUserId(req.user!.id);
  res.json(profile);
}

export async function updateMyProfile(req: Request, res: Response) {
  const profile = await profileService.updateProfile(req.user!.id, req.body);
  res.json(profile);
}

function bufferToDataUrl(mimetype: string, buffer: Buffer): string {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

export async function uploadAvatar(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  let url: string;
  if (isCloudinaryConfigured()) {
    const result = await uploadImage(file.buffer, 'avatars');
    url = result.url;
  } else {
    url = bufferToDataUrl(file.mimetype, file.buffer);
  }
  res.json({ url });
}

export const profileController = { getMyProfile, updateMyProfile, uploadAvatar };
