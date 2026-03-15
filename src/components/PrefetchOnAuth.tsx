import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { announcements, leaderboard, quests } from "@/lib/api";

/**
 * Prefetch shared data when user is authenticated so Home and other pages feel instant.
 * Runs in background; does not block render.
 */
export function PrefetchOnAuth() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    queryClient.prefetchQuery({ queryKey: ["announcements"], queryFn: () => announcements.list() });
    queryClient.prefetchQuery({
      queryKey: ["leaderboard", "allTime", 3],
      queryFn: () => leaderboard.allTime({ limit: 3, page: 1 }),
    });
    queryClient.prefetchQuery({ queryKey: ["quests"], queryFn: () => quests.get() });
  }, [token, queryClient]);

  return null;
}
