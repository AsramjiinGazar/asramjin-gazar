import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-5">
        <Skeleton className="h-20 w-20 rounded-full mx-auto mb-3" />
        <Skeleton className="h-6 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-56 mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto mt-2" />
        <Skeleton className="h-2 max-w-[200px] mx-auto mt-2 rounded-full" />
      </div>
      <Skeleton className="h-12 rounded-xl w-full mb-5" />
      <Skeleton className="h-5 w-28 mb-3" />
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-12 rounded-xl w-full" />
    </div>
  );
}
