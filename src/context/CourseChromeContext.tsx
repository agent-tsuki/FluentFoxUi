import { createContext, useContext, type ReactNode } from 'react'
import type { CourseChrome } from '@/types/courseChrome'

export type { CourseChrome, CourseChromeCounts, CourseChromeGroup, CourseChromePage, CourseChromeUnit } from '@/types/courseChrome'

const CourseChromeContext = createContext<CourseChrome | null>(null)

/**
 * CourseChromeProvider — gives the shared course chrome (header, sub-nav,
 * unit rows, rail) a course-agnostic description of the current course.
 * Callers pass a memoised value (`useMemo`) so consumers don't re-render.
 */
export function CourseChromeProvider({ value, children }: { value: CourseChrome; children: ReactNode }) {
  return <CourseChromeContext.Provider value={value}>{children}</CourseChromeContext.Provider>
}

/** The current course's chrome. Only call inside a CourseChromeProvider. */
export function useCourseChrome(): CourseChrome {
  const chrome = useContext(CourseChromeContext)
  if (!chrome) throw new Error('useCourseChrome must be used inside a CourseChromeProvider')
  return chrome
}

/** Like useCourseChrome, but null outside a provider (for components shared with non-course pages). */
export function useOptionalCourseChrome(): CourseChrome | null {
  return useContext(CourseChromeContext)
}
