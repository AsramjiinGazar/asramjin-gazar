import { QueryClient } from "@tanstack/react-query";

/** Shared content (same for all users): cache longer, background refetch */
export const SHARED_STALE_MS = 2 * 60 * 1000; // 2 min – announcements, leaderboard, quests list, students, gallery
/** Personalized data: shorter stale, still show cached while refetching */
export const PERSONALIZED_STALE_MS = 1 * 60 * 1000; // 1 min – quest progress, profile badges

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: SHARED_STALE_MS,
        gcTime: 5 * 60 * 1000, // 5 min – keep cache for back navigation
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  });
}
