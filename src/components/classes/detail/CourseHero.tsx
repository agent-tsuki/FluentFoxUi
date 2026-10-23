import { Link } from 'react-router-dom'
import { PlayOverlay } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatTotalDuration, formatUpdatedDate, formatVideoCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import { courseExternalUrl } from '@/lib/classes/youtube'
import type { ClassCourseDetail } from '@/types/classes'
import { LevelBadge, PlatformBadge, PriceBadge, TagList } from '../CourseBadges'
import { LINK_BUTTON } from '../linkStyles'
import { YouTubeLogo } from '../YouTubeLogo'

interface CourseHeroProps {
  course: ClassCourseDetail
  /** Present when there is something to play on this page (videos or a playlist id). */
  onStartWatching?: () => void
}

const NEW_TAB = <span className="sr-only">(opens in a new tab)</span>
const CTA_WIDTH = 'w-full sm:w-auto'

/**
 * CourseHero — title, channel, facts and the primary actions of a course page,
 * with the course thumbnail on the right (above the title on phones) when there
 * is one. The thumbnail starts the player here, or opens the course on YouTube.
 */
export function CourseHero({ course, onStartWatching }: CourseHeroProps) {
  const meta = PLATFORM_META[course.platform]
  const isYouTube = course.platform === 'youtube'
  const externalUrl = courseExternalUrl(course)
  const facts = [
    course.videos.length > 0 && { icon: 'play_circle', label: formatVideoCount(course.videos.length) },
    course.totalDurationSec > 0 && { icon: 'schedule', label: formatTotalDuration(course.totalDurationSec) },
    course.lastSyncedAt && formatUpdatedDate(course.lastSyncedAt) && { icon: 'calendar_today', label: `Updated ${formatUpdatedDate(course.lastSyncedAt)}` },
  ].filter((f): f is { icon: string; label: string } => Boolean(f))

  return (
    <header className="border-b border-outline-variant/40 bg-surface">
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-6 md:px-10">
        <Link
          to="/classes"
          className="-ml-1 mb-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <Icon name="arrow_back" className="text-base" />
          All classes
        </Link>

        <div className={cn('grid gap-8', course.thumbnailUrl && 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center')}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <PlatformBadge platform={course.platform} />
              <LevelBadge level={course.level} />
              <PriceBadge isFree={course.isFree} />
            </div>

            <h1 className="max-w-3xl font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">{course.title}</h1>

            {/* Plain byline: the full channel card ("Meet the channel") follows right below the hero. */}
            <p className="text-sm text-on-surface-variant">
              by{' '}
              <a href="#channel-title" className="font-semibold text-on-surface underline-offset-4 hover:underline">
                {course.channel.name}
              </a>
            </p>

            {course.summary && <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">{course.summary}</p>}

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

            {(!course.isFree || !isYouTube) && course.priceNote && (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
                <Icon name="payments" className="text-base text-on-surface-variant" />
                {course.priceNote}
              </p>
            )}

            <TagList tags={course.tags} max={4} />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              {onStartWatching && (
                <button type="button" onClick={onStartWatching} className={cn(LINK_BUTTON.primary, CTA_WIDTH)}>
                  <Icon name="play_circle" filled className="text-lg" />
                  Start watching
                </button>
              )}
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(onStartWatching ? LINK_BUTTON.outline : LINK_BUTTON.primary, CTA_WIDTH)}
              >
                {isYouTube ? <YouTubeLogo /> : <Icon name={meta.icon} className="text-lg" />}
                Open on {meta.label}
                {NEW_TAB}
              </a>
            </div>
          </div>

          {course.thumbnailUrl && (
            <HeroMedia
              thumbnailUrl={course.thumbnailUrl}
              title={course.title}
              platformLabel={meta.label}
              externalUrl={externalUrl}
              onPlay={onStartWatching}
            />
          )}
        </div>
      </div>
    </header>
  )
}

interface HeroMediaProps {
  thumbnailUrl: string
  title: string
  platformLabel: string
  externalUrl: string
  onPlay?: () => void
}

/** The poster card: plays here when the course is playable, otherwise links out. Above the title on phones. */
function HeroMedia({ thumbnailUrl, title, platformLabel, externalUrl, onPlay }: HeroMediaProps) {
  const box = cn(
    'group relative order-first flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high lg:order-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
  )
  const image = (
    <img src={thumbnailUrl} alt="" width={480} height={360} loading="eager" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
  )

  if (onPlay) {
    return (
      <button type="button" aria-label="Play playlist" onClick={onPlay} className={box}>
        {image}
        <PlayOverlay />
      </button>
    )
  }
  return (
    <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${title} on ${platformLabel} (opens in a new tab)`} className={box}>
      {image}
      <PlayOverlay />
    </a>
  )
}
