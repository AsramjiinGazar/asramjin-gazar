import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { LeaderboardSkeleton } from "@/components/skeletons/LeaderboardSkeleton";
import { StudentsSkeleton } from "@/components/skeletons/StudentsSkeleton";
import { GallerySkeleton } from "@/components/skeletons/GallerySkeleton";
import { QuestSkeleton } from "@/components/skeletons/QuestSkeleton";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

const ROUTE_SKELETONS: Record<string, ComponentType> = {
  "/": HomeSkeleton,
  "/students": StudentsSkeleton,
  "/gallery": GallerySkeleton,
  "/leaderboard": LeaderboardSkeleton,
  "/quest": QuestSkeleton,
  "/profile": ProfileSkeleton,
  "/calendar": PageSkeleton,
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    const SkeletonComponent = ROUTE_SKELETONS[location.pathname] ?? PageSkeleton;
    return <SkeletonComponent />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
