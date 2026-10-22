import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { cn } from '@/lib/cn'
import type { ClassCourseCard } from '@/types/classes'
import { CourseCard } from './CourseCard'

const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'

/** CourseGrid — the responsive card grid used on /classes and in the detail page rails. */
export function CourseGrid({ courses, className }: { courses: ClassCourseCard[]; className?: string }) {
  return (
    <ul className={cn(GRID, className)}>
      {courses.map(course => (
        <li key={course.slug}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  )
}

/** CourseGridSkeleton — mirrors CourseCard's layout while the list loads. */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingState label="Loading courses…">
      <div className={GRID}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
            <SkeletonBlock className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-4">
              <SkeletonBlock className="h-5 w-1/2 rounded-full" />
              <SkeletonBlock className="h-5 w-11/12 rounded-xl" />
              <div className="flex items-center gap-2">
                <SkeletonBlock className="size-6 rounded-full" />
                <SkeletonBlock className="h-4 w-1/3 rounded-xl" />
              </div>
              <SkeletonBlock className="h-4 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </LoadingState>
  )
}
