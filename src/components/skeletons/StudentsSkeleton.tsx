import { Skeleton } from "@/components/ui/skeleton";

export function StudentsSkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <Skeleton className="h-10 rounded-2xl w-full mb-5" />
      <Skeleton className="h-6 w-24 mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
