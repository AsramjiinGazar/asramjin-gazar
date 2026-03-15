import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from '../validators/announcementValidators.js';

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new AppError(500, 'Failed to fetch announcements');
  return data ?? [];
}

export async function createAnnouncement(userId: string | null, input: CreateAnnouncementInput) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: input.title,
      content: input.content,
      is_pinned: input.isPinned ?? false,
      created_by: userId ?? null,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create announcement');
  return data;
}

export async function updateAnnouncement(id: string, input: UpdateAnnouncementInput) {
  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;

  const { data, error } = await supabase
    .from('announcements')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update announcement');
  return data;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw new AppError(500, 'Failed to delete announcement');
  return { success: true };
}

export const announcementsService = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
