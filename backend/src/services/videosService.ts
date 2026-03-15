import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { extractVideoId, buildEmbedUrl, isValidYouTubeUrl } from '../utils/youtubeUtils.js';
import type { CreateVideoInput, UpdateVideoInput, VideosQueryInput } from '../validators/videoValidators.js';

export async function createVideo(userId: string, input: CreateVideoInput) {
  const videoId = extractVideoId(input.youtubeUrl);
  if (!videoId || !isValidYouTubeUrl(input.youtubeUrl)) {
    throw new AppError(400, 'Invalid YouTube URL');
  }

  const embedUrl = buildEmbedUrl(videoId);

  const { data, error } = await supabase
    .from('youtube_videos')
    .insert({
      title: input.title,
      youtube_url: input.youtubeUrl,
      youtube_video_id: videoId,
      embed_url: embedUrl,
      description: input.description ?? null,
      category: input.category ?? null,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create video');
  return data;
}

export async function getVideos(query: VideosQueryInput) {
  const { page, limit, category } = query;
  const offset = (page - 1) * limit;

  let q = supabase
    .from('youtube_videos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) {
    q = q.eq('category', category);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch videos');
  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getVideoById(id: string) {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new AppError(404, 'Video not found');
  return data;
}

export async function deleteVideo(id: string) {
  const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
  if (error) throw new AppError(500, 'Failed to delete video');
  return { success: true };
}

export const videosService = {
  createVideo,
  getVideos,
  getVideoById,
  deleteVideo,
};
