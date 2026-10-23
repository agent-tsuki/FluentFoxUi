import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'

/** ClassDetailSkeleton — mirrors the course hero and the first content row while the page loads. */
export function ClassDetailSkeleton() {
  return (
    <LoadingState label="Loading course…" className="mx-auto max-w-6xl space-y-10 px-4 pt-6 sm:px-6 md:px-10">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-24 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-56 rounded-xl" />
            <SkeletonBlock className="h-10 w-3/4 rounded-xl" />
            <SkeletonBlock className="h-5 w-48 rounded-xl" />
            <SkeletonBlock className="h-4 w-2/3 rounded-xl" />
            <SkeletonBlock className="h-11 w-64 rounded-xl" />
          </div>
          <SkeletonBlock className="order-first aspect-video w-full rounded-2xl lg:order-none" />
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <SkeletonBlock className="h-48 w-full rounded-2xl" />
        <SkeletonBlock className="hidden h-48 w-full rounded-2xl lg:block" />
      </div>
    </LoadingState>
  )
}
