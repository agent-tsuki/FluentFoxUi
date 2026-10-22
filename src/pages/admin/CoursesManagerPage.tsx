import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CourseFilters, EMPTY_COURSE_FILTERS, type CourseFilterValues } from '@/components/admin/courses/CourseFilters'
import { CourseRow } from '@/components/admin/courses/CourseRow'
import { useAdminChannels, useAdminCourses } from '@/hooks/admin/useAdminData'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { adminService } from '@/api/services/adminService'
import { resolveErrorMessage } from '@/api/errors'
import type { AdminCourse } from '@/types/admin'

function matches(course: AdminCourse, f: CourseFilterValues): boolean {
  const q = f.search.trim().toLowerCase()
  if (q && !course.title.toLowerCase().includes(q) && !course.slug.includes(q)) return false
  if (f.channelId && course.channelId !== f.channelId) return false
  if (f.level && course.level !== f.level) return false
  if (f.platform && course.platform !== f.platform) return false
  if (f.visibility === 'published' && !course.isPublished) return false
  if (f.visibility === 'hidden' && course.isPublished) return false
  return true
}

const COLUMNS = ['Title', 'Channel', 'Platform', 'Level', 'Free', 'Published', 'Featured', 'Order', 'Last synced']

/** /admin/classes/courses — every course the user may edit, hidden ones included. */
export function CoursesManagerPage() {
  const { can, canAny } = usePermissions()
  const courses = useAdminCourses()
  const { data: channels } = useAdminChannels()
  const [filters, setFilters] = useState(EMPTY_COURSE_FILTERS)
  const action = useAdminAction()
  const { run } = action
  const { setData } = courses

  const channelNames = useMemo(
    () => new Map((channels ?? []).map(c => [c.id, c.fields.name.effective ?? c.slug])),
    [channels],
  )
  const visible = useMemo(() => (courses.data ?? []).filter(c => matches(c, filters)), [courses.data, filters])

  const replace = useCallback((next: AdminCourse) => setData(list => list.map(c => (c.id === next.id ? next : c))), [setData])

  // Optimistic: flip now, put the old row back if the server refuses.
  const onVisibility = useCallback(async (course: AdminCourse, change: { isPublished?: boolean; isFeatured?: boolean }) => {
    replace({ ...course, ...change })
    const result = await run(`vis:${course.id}`, () =>
      adminService.setCourseVisibility(course.id, { isPublished: change.isPublished ?? course.isPublished, isFeatured: change.isFeatured ?? course.isFeatured }),
    )
    replace(result.ok ? result.value : course)
  }, [replace, run])

  const onSync = useCallback(async (course: AdminCourse) => {
    const result = await run(`sync:${course.id}`, () => adminService.syncPlaylist(course.id), `Synced “${course.title}”.`)
    if (result.ok) replace(result.value)
  }, [replace, run])

  const canCreate = canAny('classes.course.edit')

  return (
    <>
      <AdminPageHeader
        title="Courses"
        description="Publish, feature and sync courses. Hidden courses are only visible here."
        actions={canCreate && (
          <Link to="/admin/classes/courses/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary">
            <Icon name="add" className="text-base" /> New course
          </Link>
        )}
      />
      <div className="space-y-4">
        <CourseFilters value={filters} channels={channels ?? []} onChange={setFilters} />
        <div aria-live="polite">
          <StatusMessage tone="error" message={action.error} />
          <StatusMessage tone="success" message={action.notice} />
        </div>
        {courses.isLoading ? (
          <LoadingState label="Loading courses…" />
        ) : courses.error ? (
          <ErrorState message={resolveErrorMessage(courses.error)} onRetry={courses.refetch} />
        ) : !courses.data?.length ? (
          <EmptyState icon="school" title="No courses yet" description="Courses you can edit appear here." />
        ) : !visible.length ? (
          <EmptyState icon="filter_alt_off" title="No courses match" description="Try a different search or clear the filters." actionLabel="Clear filters" onAction={() => setFilters(EMPTY_COURSE_FILTERS)} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4">
            <table className="w-full min-w-[56rem] text-left">
              <caption className="sr-only">Courses ({visible.length})</caption>
              <thead>
                <tr className="border-b border-outline-variant/60 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {COLUMNS.map(col => <th key={col} scope="col" className="py-3 pr-4 font-bold">{col}</th>)}
                  <th scope="col" className="py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(course => {
                  const res = { type: 'course' as const, id: course.id, channelId: course.channelId }
                  return (
                    <CourseRow
                      key={course.id}
                      course={course}
                      channelName={course.channelName ?? channelNames.get(course.channelId) ?? '—'}
                      canEdit={can('classes.course.edit', res)}
                      canPublish={can('classes.publish', res)}
                      canSync={can('classes.sync', res)}
                      busy={action.busy}
                      onVisibility={onVisibility}
                      onSync={onSync}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
