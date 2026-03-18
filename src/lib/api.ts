/**
 * API client for backend. Uses VITE_API_URL when set (production with separate backend);
 * otherwise same origin or localhost. On 401, clears token and redirects to /login.
 */

function getApiUrl(): string {
  const env = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    if (env) return env;
    return window.location.origin;
  }
  return env || "http://localhost:3001";
}

const TOKEN_KEY = 'token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  const { params, ...rest } = options;
  const url = new URL(path.startsWith('http') ? path : `${getApiUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const headers: HeadersInit = {
    ...((rest.headers as Record<string, string>) ?? {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (rest.body && !(rest.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(url.toString(), { ...rest, headers });
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error('Cannot reach server. Make sure the backend is running (e.g. cd backend && npm run dev).');
    }
    throw e;
  }
  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? err.message ?? 'Request failed');
  }
  if (res.headers.get('content-type')?.includes('application/json')) return res.json() as Promise<T>;
  throw new Error('Server returned non-JSON response');
}

// Types (match backend responses; snake_case from DB)
export interface ApiUser {
  id: string;
  email: string;
  role: string;
}

export interface ApiProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  favorite_subject: string | null;
  success: string | null;
  role?: 'student' | 'teacher' | 'admin' | string;
  level: number;
  total_xp: number;
  [key: string]: unknown;
}

export interface AuthMeResponse {
  user: ApiUser;
  profile: ApiProfile;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
  profile: ApiProfile;
}

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, fullName: string) =>
    request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),
  me: () => request<AuthMeResponse>('/api/auth/me'),
};

export const profile = {
  getMe: () => request<ApiProfile>('/api/profile/me'),
  getMyBadges: () =>
    request<Array<{ id: string; badge_id: string; badge: { id: string; name: string; description: string | null; icon: string | null } | null }>>(
      '/api/profile/me/badges'
    ),
  update: (data: { fullName?: string; avatarUrl?: string | null; bio?: string | null; favoriteSubject?: string | null; success?: string | null }) =>
    request<ApiProfile>('/api/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return request<{ url: string }>('/api/profile/me/avatar', { method: 'POST', body: form });
  },
};

export const students = {
  list: (params?: { page?: number; limit?: number; search?: string; sort?: string; favoriteSubject?: string }) =>
    request<{ data: ApiProfile[]; total: number }>('/api/students', { params: params as Record<string, string | number | undefined> }),
  getById: (id: string) => request<ApiProfile>(`/api/students/${id}`),
};

export const gallery = {
  list: (params?: { page?: number; limit?: number; category?: string; mine?: boolean }) =>
    request<{ data: Array<{ id: string; image_url: string; caption: string | null; category: string | null; author?: { full_name: string; avatar_url: string | null } }>; total: number }>(
      '/api/gallery',
      { params: params as Record<string, string | number | undefined> }
    ),
  upload: (formData: FormData) =>
    request<{ id: string; image_url: string; caption: string | null; category: string | null }>('/api/gallery/upload', {
      method: 'POST',
      body: formData,
    }),
  delete: (id: string) => request<{ success: boolean }>(`/api/gallery/${id}`, { method: 'DELETE' }),
};

export const leaderboard = {
  allTime: (params?: { page?: number; limit?: number }) =>
    request<{ data: Array<{ rank: number; userId: string; fullName: string; avatarUrl: string | null; totalXP: number; level: number }>; total: number }>(
      '/api/leaderboard/all-time',
      { params: params as Record<string, string | number | undefined> }
    ).then((r) => r ?? { data: [], total: 0 }),
  monthly: (params?: { page?: number; limit?: number }) =>
    request<{ data: Array<{ rank: number; userId: string; fullName: string; avatarUrl: string | null; totalXP: number; level: number }>; total: number }>(
      '/api/leaderboard/monthly',
      { params: params as Record<string, string | number | undefined> }
    ).then((r) => r ?? { data: [], total: 0 }),
};

export const announcements = {
  list: () =>
    request<Array<{ id: string; title: string; content: string; created_by: string | null }>>('/api/announcements'),
};

export const quests = {
  get: () => request<unknown[]>('/api/quests').then((r) => r ?? []),
  getMyProgress: () => request<unknown[]>('/api/quests/me').then((r) => r ?? []),
};

/** Admin panel (no auth required): create quests and announcements */
export const panel = {
  createQuest: (data: {
    title: string;
    description?: string | null;
    type: 'daily' | 'weekly' | 'special';
    xpReward: number;
    startDate?: string | null;
    endDate?: string | null;
  }) => request<unknown>('/api/panel/quests', { method: 'POST', body: JSON.stringify(data) }),
  awardQuestXp: (questId: string, userIds: string[]) =>
    request<{ success: true; awardedCount: number; skippedCount: number }>(`/api/panel/quests/${questId}/award-xp`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    }),
  listBadges: () =>
    request<Array<{ id: string; name: string; description: string | null; icon: string | null; rule_type: string | null }>>('/api/panel/badges'),
  createBadge: (data: { name: string; description?: string | null; icon?: string | null; ruleType?: string | null }) =>
    request<unknown>('/api/panel/badges', { method: 'POST', body: JSON.stringify(data) }),
  awardBadges: (badgeId: string, userIds: string[]) =>
    request<{ success: true; awardedCount: number; skippedCount: number }>('/api/panel/badges/award', {
      method: 'POST',
      body: JSON.stringify({ badgeId, userIds }),
    }),
  createAnnouncement: (data: { title: string; content: string; isPinned?: boolean }) =>
    request<unknown>('/api/panel/announcements', { method: 'POST', body: JSON.stringify(data) }),
};

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function hasToken(): boolean {
  return !!getToken();
}
