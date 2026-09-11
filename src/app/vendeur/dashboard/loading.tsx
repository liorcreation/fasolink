import { Skeleton } from "@/components/ui/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="container-faso-wide py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mt-10 space-y-6">
        <Skeleton className="h-20 rounded-3xl" />
        <Skeleton className="h-20 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    </div>
  );
}
