import { Skeleton } from "@/components/ui/skeleton";

/** Generic page skeleton for routes without a dedicated skeleton (e.g. Calendar) */
export function PageSkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-64 rounded-2xl w-full mb-6" />
      <Skeleton className="h-6 w-32 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-14 rounded-xl w-full" />
        <Skeleton className="h-14 rounded-xl w-full" />
        <Skeleton className="h-14 rounded-xl w-full" />
      </div>
    </div>
  );
}
