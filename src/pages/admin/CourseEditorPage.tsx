import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Switch } from '@/components/ui/Switch'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { CourseForm, courseInputFrom } from '@/components/admin/courses/CourseForm'
import { useAdminChannels, useAdminCourse } from '@/hooks/admin/useAdminData'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { adminService } from '@/api/services/adminService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { syncedLabel } from '@/lib/admin/format'
import type { AdminCourse, CourseInput } from '@/types/admin'

const BACK = { to: '/admin/classes/courses', label: 'Courses' }

/** /admin/classes/courses/:id (or /new?channel_id=) — create or edit one course. */
export function CourseEditorPage() {
  const { id = 'new' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const { can, canAny } = usePermissions()
  const course = useAdminCourse(id)
  const channels = useAdminChannels()
  const action = useAdminAction()

  if (course.isLoading || channels.isLoading) return <LoadingState label="Loading course…" />
  const loadError = course.error ?? channels.error
  if (loadError) {
    if (hasErrorCode(loadError, 'FORBIDDEN')) return <AdminForbidden message="You don't have access to this course." />
    return <ErrorState message={resolveErrorMessage(loadError)} onRetry={() => { course.refetch(); channels.refetch() }} />
  }
  if (isNew && !canAny('classes.course.edit')) return <AdminForbidden message="You can't create courses." />

  const current = course.data ?? null
  const res = current ? { type: 'course' as const, id: current.id, channelId: current.channelId } : undefined
  const canPublish = !!res && can('classes.publish', res)
  const canSync = !!res && can('classes.sync', res) && current?.platform === 'youtube' && !!current.playlistId

  const save = async (input: CourseInput) => {
    const result = await action.run('save', () => (current ? adminService.updateCourse(current.id, input) : adminService.createCourse(input)), 'Course saved.')
    if (!result.ok) return
    if (current) course.setData(result.value)
    else navigate(`/admin/classes/courses/${result.value.id}`, { replace: true })
  }

  const apply = async (key: string, call: () => Promise<AdminCourse>, notice: string) => {
    const result = await action.run(key, call, notice)
    if (result.ok) course.setData(result.value)
  }

  const remove = async () => {
    if (!current || !window.confirm(`Delete “${current.title}”? This can't be undone.`)) return
    const result = await action.run('delete', () => adminService.deleteCourse(current.id))
    if (result.ok) navigate(BACK.to, { replace: true })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={current?.title ?? 'New course'}
        description={current ? `Last synced ${syncedLabel(current.lastSyncedAt).toLowerCase()}` : 'Add a curated course to a channel.'}
        back={BACK}
        actions={current && (
          <>
            {canSync && (
              <Button type="button" variant="outline" className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm" disabled={action.busy === 'sync'}
                onClick={() => void apply('sync', () => adminService.syncPlaylist(current.id), 'Playlist synced.')}>
                <Icon name="refresh" className={action.busy === 'sync' ? 'animate-spin text-base' : 'text-base'} /> Sync playlist
              </Button>
            )}
            <Button type="button" variant="ghost" className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm text-error" disabled={action.busy === 'delete'} onClick={() => void remove()}>
              <Icon name="delete_forever" className="text-base" /> Delete
            </Button>
          </>
        )}
      />
      <div aria-live="polite">
        <StatusMessage tone="error" message={action.error} />
        <StatusMessage tone="success" message={action.notice} />
      </div>
      {current && canPublish && (
        <section aria-label="Visibility" className="flex flex-wrap gap-x-8 rounded-2xl border border-outline-variant/50 bg-surface-container-low px-5 py-2">
          <Switch label="Published" checked={current.isPublished} busy={action.busy === 'vis'}
            onChange={v => void apply('vis', () => adminService.setCourseVisibility(current.id, { isPublished: v, isFeatured: current.isFeatured }), v ? 'Course is live.' : 'Course hidden.')} />
          <Switch label="Featured" checked={current.isFeatured} busy={action.busy === 'vis'}
            onChange={v => void apply('vis', () => adminService.setCourseVisibility(current.id, { isPublished: current.isPublished, isFeatured: v }), 'Saved.')} />
        </section>
      )}
      <section aria-label="Course details" className="rounded-2xl border border-outline-variant/50 bg-surface-container-low p-5 sm:p-6">
        <CourseForm
          key={current?.id ?? 'new'}
          initial={courseInputFrom(current, params.get('channel_id') ?? '')}
          channels={channels.data ?? []}
          isNew={!current}
          saving={action.busy === 'save'}
          onSubmit={input => void save(input)}
        />
      </section>
    </div>
  )
}
