import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for protected route auth check – matches app shell + content area */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-28 rounded-2xl w-full mb-5" />
      <Skeleton className="h-5 w-40 mb-3" />
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-32 rounded-xl" />
        <Skeleton className="flex-1 h-32 rounded-xl" />
        <Skeleton className="flex-1 h-32 rounded-xl" />
      </div>
      <Skeleton className="h-5 w-24 mt-6 mb-3" />
      <div className="space-y-2.5">
        <Skeleton className="h-16 rounded-xl w-full" />
        <Skeleton className="h-16 rounded-xl w-full" />
      </div>
    </div>
  );
}
