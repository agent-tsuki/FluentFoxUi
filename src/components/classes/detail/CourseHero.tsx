import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatTotalDuration, formatUpdatedDate, formatVideoCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassCourseDetail } from '@/types/classes'
import { ChannelAvatar } from '../ChannelAvatar'
import { LevelBadge, PlatformBadge, PriceBadge, TagList } from '../CourseBadges'
import { LINK_BUTTON } from '../linkStyles'
import { YouTubeLogo } from '../YouTubeLogo'

interface CourseHeroProps {
  course: ClassCourseDetail
  /** Present when there is a playlist to play here. */
  onStartWatching?: () => void
}

/** CourseHero — title, channel, facts and the primary actions of a course page. */
export function CourseHero({ course, onStartWatching }: CourseHeroProps) {
  const meta = PLATFORM_META[course.platform]
  const isYouTube = course.platform === 'youtube'
  const facts = [
    course.videos.length > 0 && { icon: 'play_circle', label: formatVideoCount(course.videos.length) },
    course.totalDurationSec > 0 && { icon: 'schedule', label: formatTotalDuration(course.totalDurationSec) },
    course.lastSyncedAt && { icon: 'calendar_today', label: `Updated ${formatUpdatedDate(course.lastSyncedAt)}` },
  ].filter((f): f is { icon: string; label: string } => Boolean(f))

  return (
    <header className={cn('border-b border-outline-variant/40 bg-gradient-to-br to-transparent', meta.heroFromClass)}>
      <div className="mx-auto max-w-5xl px-6 pb-12 pt-10 md:px-10">
        <Link
          to="/classes"
          className="-my-2 mb-6 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <Icon name="arrow_back" className="text-base" />
          All classes
        </Link>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={course.platform} />
            <LevelBadge level={course.level} />
            <PriceBadge isFree={course.isFree} />
          </div>

          <h1 className="max-w-3xl font-headline text-display-sm font-extrabold tracking-tight text-on-surface">{course.title}</h1>

          <div className="flex items-center gap-3">
            <ChannelAvatar name={course.channel.name} avatarUrl={course.channel.avatarUrl} size="md" />
            <span className="font-semibold text-on-surface">{course.channel.name}</span>
            {isYouTube && <YouTubeLogo title="YouTube channel" />}
          </div>

          {course.summary && <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">{course.summary}</p>}

          {facts.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
              {facts.map(f => (
                <li key={f.label} className="inline-flex items-center gap-1.5">
                  <Icon name={f.icon} className="text-base" />
                  {f.label}
                </li>
              ))}
            </ul>
          )}

          {!course.isFree || !isYouTube ? (
            course.priceNote && (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
                <Icon name="payments" className="text-base text-on-surface-variant" />
                {course.priceNote}
              </p>
            )
          ) : null}

          <TagList tags={course.tags} />

          <div className="flex flex-wrap gap-3 pt-1">
            {onStartWatching && (
              <button type="button" onClick={onStartWatching} className={LINK_BUTTON.primary}>
                <Icon name="play_circle" filled className="text-lg" />
                Start watching
              </button>
            )}
            <a href={course.url} target="_blank" rel="noopener noreferrer" className={onStartWatching ? LINK_BUTTON.outline : LINK_BUTTON.primary}>
              {isYouTube ? <YouTubeLogo /> : <Icon name={meta.icon} className="text-lg" />}
              Open on {meta.label}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
