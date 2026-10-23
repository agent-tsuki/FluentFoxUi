import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'

/** ClassDetailSkeleton — mirrors the course hero and the channel card while the page loads. */
export function ClassDetailSkeleton() {
  return (
    <LoadingState label="Loading course…" className="mx-auto max-w-5xl space-y-10 px-6 pt-6 md:px-10">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-24 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div className="space-y-3">
            <div className="flex gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="h-8 w-3/4 rounded-xl" />
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-10 rounded-full" />
              <SkeletonBlock className="h-5 w-48 rounded-xl" />
            </div>
            <SkeletonBlock className="h-4 w-2/3 rounded-xl" />
            <SkeletonBlock className="h-11 w-64 rounded-xl" />
          </div>
          <SkeletonBlock className="order-first aspect-video w-full rounded-2xl lg:order-none" />
        </div>
      </div>
      <SkeletonBlock className="aspect-[4/1] w-full rounded-2xl md:aspect-[6/1]" />
    </LoadingState>
  )
}
