import type { Request, Response } from 'express';
import { profileService } from '../services/profileService.js';

export async function getStudents(req: Request, res: Response) {
  const result = await profileService.getStudents(req.query as unknown as Parameters<typeof profileService.getStudents>[0]);
  res.json(result);
}

export async function getStudentById(req: Request, res: Response) {
  const profile = await profileService.getStudentById(req.params.id);
  res.json(profile);
}

export const studentsController = { getStudents, getStudentById };
