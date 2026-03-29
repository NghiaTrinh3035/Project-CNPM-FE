import { Skeleton } from "@/shared/ui/skeleton";

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-3 rounded-2xl border border-border/60 p-3">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);
