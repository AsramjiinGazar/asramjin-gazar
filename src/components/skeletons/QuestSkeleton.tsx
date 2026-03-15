import { Skeleton } from "@/components/ui/skeleton";

export function QuestSkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <Skeleton className="h-8 w-36 mb-1" />
      <Skeleton className="h-4 w-56 mb-5" />
      <Skeleton className="h-24 rounded-2xl w-full mb-6" />
      <Skeleton className="h-5 w-40 mb-3" />
      <div className="space-y-2.5">
        <Skeleton className="h-20 rounded-xl w-full" />
        <Skeleton className="h-20 rounded-xl w-full" />
        <Skeleton className="h-20 rounded-xl w-full" />
      </div>
    </div>
  );
}
