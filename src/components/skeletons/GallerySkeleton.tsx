import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <Skeleton className="h-8 w-40 mb-1" />
      <Skeleton className="h-4 w-48 mb-4" />
      <div className="flex gap-2 overflow-hidden mb-3">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
