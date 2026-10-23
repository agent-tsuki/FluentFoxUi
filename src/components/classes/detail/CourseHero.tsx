import { Link } from 'react-router-dom'
import { PlayOverlay, VideoEmbed } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatTotalDuration, formatVideoCount, levelStage } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import { courseExternalUrl } from '@/lib/classes/youtube'
import type { ClassCourseDetail } from '@/types/classes'
import { LINK_BUTTON } from '../linkStyles'

/** What the hero's media and "Start watching" do on this course. */
export type HeroPlayback =
  /** Play the whole playlist right here, in the hero. */
  | 'inline'
  /** Jump to the lessons list below, which has its own player. */
  | 'lessons'
  /** Nothing to play on FoxSensei: link out to the platform. */
  | 'external'

interface CourseHeroProps {
  course: ClassCourseDetail
  playback: HeroPlayback
  /** The learner pressed play: in `inline` mode the poster becomes the player. */
  playing: boolean
  onStartWatching: () => void
}

const NEW_TAB = <span className="sr-only">(opens in a new tab)</span>

/**
 * CourseHero — level/price crumbs, title, byline, summary and the two actions
 * on the left; a large course poster on the right (above the title on phones)
 * that plays the course.
 */
export function CourseHero({ course, playback, playing, onStartWatching }: CourseHeroProps) {
  const meta = PLATFORM_META[course.platform]
  const externalUrl = courseExternalUrl(course)
  const crumbs = [`JLPT ${course.level}`, levelStage(course.level), `${course.isFree ? 'Free' : 'Paid'} on ${meta.label}`].filter(Boolean)
  const facts = [
    course.videos.length > 0 ? formatVideoCount(course.videos.length) : '',
    formatTotalDuration(course.totalDurationSec),
  ].filter(Boolean)
  const canPlay = playback !== 'external'

  return (
    <header className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 md:px-10">
      <Link
        to="/classes"
        className="-ml-1 mb-3 inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <Icon name="arrow_back" className="text-lg" />
        All classes
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <div className="space-y-4">
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant">
            {crumbs.map((crumb, i) => (
              <span key={crumb} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-outline">/</span>}
                {crumb}
              </span>
            ))}
          </p>

          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-extrabold leading-tight tracking-tight text-on-surface md:text-4xl">{course.title}</h1>
            <p className="text-base text-on-surface-variant md:text-lg">
              by{' '}
              <a href="#teacher" className="font-medium text-on-surface underline-offset-4 hover:underline">
                {course.channel.name}
              </a>
            </p>
          </div>

          {course.summary && <p className="max-w-xl text-base leading-relaxed text-on-surface-variant">{course.summary}</p>}

          {!course.isFree && course.priceNote && (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Icon name="payments" className="text-base text-on-surface-variant" />
              {course.priceNote}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            {canPlay ? (
              <button type="button" onClick={onStartWatching} className={cn(LINK_BUTTON.primary, 'w-full px-6 text-base sm:w-auto')}>
                <Icon name="play_circle" filled className="text-xl" />
                Start watching
              </button>
            ) : (
              <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={cn(LINK_BUTTON.primary, 'w-full px-6 text-base sm:w-auto')}>
                <Icon name={meta.icon} className="text-xl" />
                Go to course
                {NEW_TAB}
              </a>
            )}
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-on-surface underline decoration-outline underline-offset-4 transition-colors hover:decoration-on-surface"
            >
              Watch on {meta.label}
              <Icon name="north_east" className="text-base" />
              {NEW_TAB}
            </a>
          </div>

          {(facts.length > 0 || course.tags.length > 0) && (
            <p className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-sm text-on-surface-variant">
              {facts.map(f => <span key={f} className="font-semibold text-on-surface">{f}</span>)}
              {course.tags.slice(0, 5).map(tag => <span key={tag}>{tag}</span>)}
            </p>
          )}
        </div>

        <HeroMedia course={course} playback={playback} playing={playing} externalUrl={externalUrl} onPlay={onStartWatching} />
      </div>
    </header>
  )
}

interface HeroMediaProps {
  course: ClassCourseDetail
  playback: HeroPlayback
  playing: boolean
  externalUrl: string
  onPlay: () => void
}

/** The poster: plays here, jumps to the lessons, or links out. Above the title on phones. */
function HeroMedia({ course, playback, playing, externalUrl, onPlay }: HeroMediaProps) {
  const order = 'order-first lg:order-none'
  if (playback === 'inline' && playing && course.playlistId) {
    return (
      <div className={order}>
        <VideoEmbed playlistId={course.playlistId} posterUrl={course.thumbnailUrl} title={course.title} autoPlay />
      </div>
    )
  }
  if (!course.thumbnailUrl && playback === 'external') return null

  const caption = playback === 'external' ? `Open on ${PLATFORM_META[course.platform].label}` : 'Play the course'
  const box = cn(
    order,
    'group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high shadow-elevation-2',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
  )
  const content = (
    <>
      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt=""
          width={640}
          height={360}
          loading="eager"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
        />
      )}
      <PlayOverlay />
      {/* surface-inverse is dark in both themes, so the caption reads the same in light and dark. */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-inverse/80 to-transparent px-4 pb-3 pt-10 text-left text-sm font-semibold text-on-surface-inverse">
        {caption}
      </span>
    </>
  )

  if (playback === 'external') {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`${caption}: ${course.title} (opens in a new tab)`} className={box}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" aria-label={`Play ${course.title}`} onClick={onPlay} className={box}>
      {content}
    </button>
  )
}
