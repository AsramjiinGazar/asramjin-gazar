import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <Skeleton className="h-8 w-48 mb-5" />
      <div className="flex bg-card rounded-xl p-1 mb-5 gap-1">
        <Skeleton className="flex-1 h-9 rounded-lg" />
        <Skeleton className="flex-1 h-9 rounded-lg" />
      </div>
      <div className="flex items-end justify-center gap-3 mb-6">
        <Skeleton className="flex-1 h-40 rounded-2xl" />
        <Skeleton className="flex-1 h-44 rounded-2xl -mb-2" />
        <Skeleton className="flex-1 h-40 rounded-2xl" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
