export { isClassNotFound } from '@/api/services/classesService'
import { classesService, peekClassDetail } from '@/api/services/classesService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import type { ClassCourseDetail } from '@/types/classes'

/** One course page (`GET /classes/{slug}`). Use `isClassNotFound(error)` for the 404 state. */
export function useClassDetail(slug: string): AsyncState<ClassCourseDetail> {
  return useAsync(
    `class-detail-${slug}`,
    () => classesService.getClassDetail(slug),
    () => peekClassDetail(slug),
  )
}
