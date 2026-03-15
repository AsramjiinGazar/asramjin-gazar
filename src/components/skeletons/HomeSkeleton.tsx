import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for Home page sections when no cached data yet */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-28 rounded-2xl w-full" />
      <section>
        <Skeleton className="h-5 w-44 mb-3" />
        <div className="flex gap-3 items-end">
          <Skeleton className="flex-1 h-28 rounded-xl" />
          <Skeleton className="flex-1 h-32 rounded-xl" />
          <Skeleton className="flex-1 h-28 rounded-xl" />
        </div>
      </section>
      <section>
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="space-y-2.5">
          <Skeleton className="h-14 rounded-xl w-full" />
          <Skeleton className="h-14 rounded-xl w-full" />
          <Skeleton className="h-14 rounded-xl w-full" />
        </div>
      </section>
    </div>
  );
}
