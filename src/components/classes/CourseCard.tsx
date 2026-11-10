import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatTotalDuration, formatVideoCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassCourseCard } from '@/types/classes'
import { HIGH_FETCH_PRIORITY } from '@/lib/fetchPriority'
import { ChannelAvatar } from './ChannelAvatar'
import { YouTubeLogo } from './YouTubeLogo'

interface CourseCardProps {
  course: ClassCourseCard
  /** First cards on screen: load the thumbnail eagerly at high priority. */
  priority?: boolean
  className?: string
}

/** CourseCard — one compact course tile in the /classes grid and the detail page rails. */
export const CourseCard = memo(function CourseCard({ course, className, priority = false }: CourseCardProps) {
  const meta = PLATFORM_META[course.platform]
  const duration = formatTotalDuration(course.totalDurationSec)
  const length = [course.videoCount > 0 ? formatVideoCount(course.videoCount) : '', duration].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/classes/${course.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface-raised',
        'transition-colors duration-200 hover:border-line-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
    >
      <CardMedia course={course} length={length} priority={priority} />

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink">{course.title}</h3>

        <div className="flex min-w-0 items-center gap-2">
          <ChannelAvatar name={course.channel.name} avatarUrl={course.channel.avatarUrl} size="sm" />
          <span className="truncate text-xs text-ink-muted">{course.channel.name}</span>
        </div>

        <p className="flex h-4 items-center gap-1.5 text-xs text-ink-muted">
          {course.platform === 'youtube' ? <YouTubeLogo className="h-3" /> : <Icon name={meta.icon} className="text-sm" />}
          {meta.label}
          <span aria-hidden="true">·</span>
          <span className={cn('font-semibold', course.isFree ? 'text-success' : 'text-warning')}>{course.isFree ? 'Free' : 'Paid'}</span>
          {course.isFeatured && (
            <span className="ml-auto inline-flex items-center gap-0.5 font-semibold text-primary">
              <Icon name="star" filled className="text-sm" />
              Featured
            </span>
          )}
        </p>
      </div>
    </Link>
  )
})

/** Always 16:9 so card rows line up, with or without a thumbnail. */
function CardMedia({ course, length, priority }: { course: ClassCourseCard; length: string; priority: boolean }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-surface-hover">
      {course.thumbnailUrl ? (
        <img
          src={course.thumbnailUrl}
          alt=""
          width={480}
          height={270}
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? HIGH_FETCH_PRIORITY : {})}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name={PLATFORM_META[course.platform].icon} className="text-4xl text-ink-subtle" />
        </div>
      )}
      {length && (
        <span className="absolute bottom-2 right-2 rounded-full bg-surface-inverse/85 px-2 py-0.5 text-2xs font-bold text-on-surface-inverse">
          {length}
        </span>
      )}
    </div>
  )
}
