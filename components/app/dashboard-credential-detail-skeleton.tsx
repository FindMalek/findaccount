import { Skeleton } from "@/components/ui/skeleton"

export function DashboardCredentialDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="size-8" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-6">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
