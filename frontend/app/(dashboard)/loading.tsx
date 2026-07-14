"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Skeleton Top Header / Hero */}
      <div className="flex flex-col items-center justify-center pt-8 pb-10 text-center">
        <Skeleton className="h-48 w-48 rounded-full mb-6" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      
      {/* Skeleton Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}
