import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { awardXP } from './xpService.js';
import type { CreatePostInput, UpdatePostInput, PostsQueryInput } from '../validators/postValidators.js';

export async function createPost(userId: string, input: CreatePostInput) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content: input.content,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create post');

  await awardXP(userId, 'post_created', {
    referenceType: 'post',
    referenceId: data.id,
  });
  const { checkAndUpdateProgress } = await import('./questsService.js');
  await checkAndUpdateProgress(userId, 'post_created');
  const { checkAndAwardBadges } = await import('./badgesService.js');
  await checkAndAwardBadges(userId);

  return data;
}

export async function getPosts(query: PostsQueryInput) {
  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_deleted', false)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch posts');

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .eq('status', 'active');

  const postsWithAuthors = await attachAuthors(posts ?? []);
  return {
    data: postsWithAuthors,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getPostById(id: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error || !post) throw new AppError(404, 'Post not found');
  const [withAuthor] = await attachAuthors([post]);
  return withAuthor;
}

async function attachAuthors(posts: { user_id: string }[]) {
  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, level, total_xp')
    .in('user_id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  return posts.map((p) => ({
    ...p,
    author: profileMap.get(p.user_id) ?? null,
  }));
}

export async function updatePost(id: string, userId: string, role: string, input: UpdatePostInput) {
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', id).single();
  if (!post) throw new AppError(404, 'Post not found');
  if (post.user_id !== userId && role !== 'admin') {
    throw new AppError(403, 'Not authorized to update this post');
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.content !== undefined) updateData.content = input.content;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.status !== undefined && role === 'admin') updateData.status = input.status;

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update post');
  return data;
}

export async function deletePost(id: string, userId: string, role: string) {
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', id).single();
  if (!post) throw new AppError(404, 'Post not found');
  if (post.user_id !== userId && role !== 'admin') {
    throw new AppError(403, 'Not authorized to delete this post');
  }

  const { error } = await supabase.from('posts').update({ is_deleted: true, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new AppError(500, 'Failed to delete post');
  return { success: true };
}

export const postsService = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
