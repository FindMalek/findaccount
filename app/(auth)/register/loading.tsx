import { siteConfig } from "@/config/site"

import { Skeleton } from "@/components/ui/skeleton"

export default function RegisterLoading() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md">
              <Skeleton className="size-6" />
            </div>
            <span className="sr-only">{siteConfig.name}</span>
          </div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="size-40" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="mt-4 flex justify-center gap-1 text-xs">
          <Skeleton className="size-32" />
        </div>
      </div>
    </div>
  )
}
