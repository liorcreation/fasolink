import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-lg bg-clay-100",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
    />
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-4 pt-8">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between border-t border-clay-100 pt-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ShopGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ShopCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
