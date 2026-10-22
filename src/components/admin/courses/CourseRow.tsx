import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Switch } from '@/components/ui/Switch'
import { syncedLabel } from '@/lib/admin/format'
import type { AdminCourse } from '@/types/admin'

const PLATFORM_LABEL: Record<AdminCourse['platform'], string> = { youtube: 'YouTube', udemy: 'Udemy', website: 'Website' }

/** One course in the manager table. Controls appear only with their permission. */
interface CourseRowProps {
  course: AdminCourse
  channelName: string
  canEdit: boolean
  canPublish: boolean
  canSync: boolean
  busy: string | null
  onVisibility: (course: AdminCourse, change: { isPublished?: boolean; isFeatured?: boolean }) => void
  onSync: (course: AdminCourse) => void
}

export const CourseRow = memo(function CourseRow({ course, channelName, canEdit, canPublish, canSync, busy, onVisibility, onSync }: CourseRowProps) {
  const syncing = busy === `sync:${course.id}`
  const toggling = busy === `vis:${course.id}`
  return (
    <tr className="border-b border-outline-variant/40 align-middle last:border-b-0">
      <th scope="row" className="max-w-[16rem] py-3 pr-4 text-left font-normal">
        {canEdit ? (
          <Link to={`/admin/classes/courses/${course.id}`} className="font-semibold text-on-surface hover:text-primary hover:underline">{course.title}</Link>
        ) : (
          <span className="font-semibold text-on-surface">{course.title}</span>
        )}
        <span className="block truncate text-xs text-on-surface-variant">{course.slug}</span>
      </th>
      <td className="py-3 pr-4 text-sm text-on-surface-variant">{channelName}</td>
      <td className="py-3 pr-4 text-sm text-on-surface-variant">{PLATFORM_LABEL[course.platform]}</td>
      <td className="py-3 pr-4"><Chip>{course.level}</Chip></td>
      <td className="py-3 pr-4">{course.isFree ? <Chip tone="success">Free</Chip> : <Chip>Paid</Chip>}</td>
      <td className="py-3 pr-4">
        {canPublish
          ? <Switch hideLabel label={`Published: ${course.title}`} checked={course.isPublished} busy={toggling} onChange={v => onVisibility(course, { isPublished: v })} />
          : <Chip tone={course.isPublished ? 'success' : 'neutral'}>{course.isPublished ? 'Published' : 'Hidden'}</Chip>}
      </td>
      <td className="py-3 pr-4">
        {canPublish
          ? <Switch hideLabel label={`Featured: ${course.title}`} checked={course.isFeatured} busy={toggling} onChange={v => onVisibility(course, { isFeatured: v })} />
          : course.isFeatured ? <Chip tone="primary">Featured</Chip> : <span className="text-sm text-on-surface-variant">—</span>}
      </td>
      <td className="py-3 pr-4 text-sm tabular-nums text-on-surface-variant">{course.sortOrder}</td>
      <td className="whitespace-nowrap py-3 pr-4 text-sm text-on-surface-variant">{syncedLabel(course.lastSyncedAt)}</td>
      <td className="py-3 text-right">
        {canSync && course.platform === 'youtube' && course.playlistId && (
          <button
            type="button"
            onClick={() => onSync(course)}
            disabled={syncing}
            aria-label={`Sync playlist for ${course.title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-60"
          >
            <Icon name={syncing ? 'progress_activity' : 'refresh'} className={syncing ? 'animate-spin text-xl' : 'text-xl'} />
          </button>
        )}
      </td>
    </tr>
  )
})
