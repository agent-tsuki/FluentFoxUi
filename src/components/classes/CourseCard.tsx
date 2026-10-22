import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatTotalDuration, formatVideoCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassCourseCard } from '@/types/classes'
import { ChannelAvatar } from './ChannelAvatar'
import { PlatformBadge, PriceBadge, TagList } from './CourseBadges'

interface CourseCardProps {
  course: ClassCourseCard
  className?: string
}

/** CourseCard — one course in the /classes grid and the "more from" / "similar" rails. */
export const CourseCard = memo(function CourseCard({ course, className }: CourseCardProps) {
  const duration = formatTotalDuration(course.totalDurationSec)
  const length = [course.videoCount > 0 ? formatVideoCount(course.videoCount) : '', duration].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/classes/${course.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-elevation-1',
        'transition duration-200 ease-out hover:shadow-elevation-3 motion-safe:hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
    >
      <CardMedia course={course} length={length} />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={course.platform} />
          <PriceBadge isFree={course.isFree} />
          {course.isFeatured && (
            <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wide text-primary">
              <Icon name="workspace_premium" className="text-sm" />
              Featured
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 font-headline text-base font-bold leading-snug text-on-surface">{course.title}</h3>

        <div className="flex min-w-0 items-center gap-2">
          <ChannelAvatar name={course.channel.name} avatarUrl={course.channel.avatarUrl} size="sm" />
          <span className="truncate text-sm font-semibold text-on-surface-variant">{course.channel.name}</span>
        </div>

        {course.summary && <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{course.summary}</p>}

        <TagList tags={course.tags} max={3} className="mt-auto pt-1" />
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant/40 px-4 py-3 text-xs">
        <span className="font-semibold text-on-surface-variant">JLPT {course.level}</span>
        <span className="inline-flex items-center gap-1 font-bold text-primary">
          View course
          <Icon name="arrow_forward" className="text-sm transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
})

function CardMedia({ course, length }: { course: ClassCourseCard; length: string }) {
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden', PLATFORM_META[course.platform].bg)}>
      {course.thumbnailUrl ? (
        <img
          src={course.thumbnailUrl}
          alt=""
          width={480}
          height={270}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        // No thumbnail yet (filled by YouTube sync): show the channel instead of an empty box.
        <div className="absolute inset-0 flex items-center justify-center">
          <ChannelAvatar name={course.channel.name} avatarUrl={course.channel.avatarUrl} size="lg" className="shadow-elevation-2" />
        </div>
      )}
      {length && (
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-surface-inverse/85 px-2.5 py-1 text-2xs font-bold text-on-surface-inverse">
          <Icon name="play_circle" className="text-sm" />
          {length}
        </span>
      )}
    </div>
  )
}
