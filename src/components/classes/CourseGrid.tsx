import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { cn } from '@/lib/cn'
import type { ClassCourseCard } from '@/types/classes'
import { CourseCard } from './CourseCard'

type MaxCols = 4 | 5

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
const GRID_COLS: Record<MaxCols, string> = { 4: GRID, 5: `${GRID} xl:grid-cols-5` }

interface CourseGridProps {
  courses: ClassCourseCard[]
  /** 5 on the full-width list page; 4 in the narrower detail-page rails. Default 5. */
  maxCols?: MaxCols
  className?: string
}

/** CourseGrid — the responsive card grid used on /classes and in the detail page rails. */
export function CourseGrid({ courses, maxCols = 5, className }: CourseGridProps) {
  return (
    <ul className={cn(GRID_COLS[maxCols], className)}>
      {courses.map(course => (
        <li key={course.slug}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  )
}

/** CourseGridSkeleton — mirrors CourseCard's layout while the list loads. */
export function CourseGridSkeleton({ count = 8, maxCols = 5 }: { count?: number; maxCols?: MaxCols }) {
  return (
    <LoadingState label="Loading courses…">
      <div className={GRID_COLS[maxCols]}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
            <SkeletonBlock className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-3">
              <SkeletonBlock className="h-4 w-11/12 rounded-xl" />
              <div className="flex items-center gap-2">
                <SkeletonBlock className="size-6 rounded-full" />
                <SkeletonBlock className="h-3 w-1/2 rounded-xl" />
              </div>
              <SkeletonBlock className="h-3 w-1/3 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </LoadingState>
  )
}
