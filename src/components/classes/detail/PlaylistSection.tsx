import { forwardRef } from 'react'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatVideoDuration } from '@/lib/classes/format'
import type { ClassVideo } from '@/types/classes'
import { LINK_BUTTON } from '../linkStyles'
import { YouTubeLogo } from '../YouTubeLogo'
import { SectionTitle } from './SectionTitle'

interface PlaylistSectionProps {
  videos: ClassVideo[]
  selectedIndex: number
  /** The learner already pressed play once: later picks start straight away. */
  started: boolean
  courseUrl: string
  onSelect: (index: number) => void
  onPlay: () => void
}

/**
 * PlaylistSection — a click-to-load YouTube player (youtube-nocookie, no
 * iframe until the learner presses play) beside the ordered video list.
 */
export const PlaylistSection = forwardRef<HTMLElement, PlaylistSectionProps>(function PlaylistSection(
  { videos, selectedIndex, started, courseUrl, onSelect, onPlay },
  ref,
) {
  const current = videos[selectedIndex] ?? videos[0]

  return (
    <section ref={ref} id="playlist" aria-labelledby="playlist-title" className="scroll-mt-28">
      <SectionTitle id="playlist-title" icon="format_list_numbered">Playlist</SectionTitle>

      {!current ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-6">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            The video list appears here once this playlist has been synced from YouTube. You can already watch it there.
          </p>
          <a href={courseUrl} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON.outline}>
            <YouTubeLogo />
            Watch on YouTube
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            {/* key: a new video remounts the player; `started` skips the thumbnail step after the first play. */}
            <VideoEmbed key={`${current.youtubeVideoId}-${started ? 'on' : 'off'}`} youtubeId={current.youtubeVideoId} title={current.title} autoPlay={started} onPlay={onPlay} />
            <p className="font-headline text-base font-bold text-on-surface">
              <span className="text-on-surface-variant">{current.position}. </span>
              {current.title}
            </p>
          </div>

          <ol aria-label="Videos" className="max-h-[28rem] space-y-1 overflow-y-auto rounded-2xl border border-outline-variant/40 bg-surface-container-low p-2">
            {videos.map((video, i) => {
              const active = video === current
              return (
                <li key={video.youtubeVideoId + video.position}>
                  <button
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => onSelect(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      active ? 'bg-primary/10' : 'hover:bg-surface-container-high',
                    )}
                  >
                    <span className={cn('w-6 shrink-0 text-center text-xs font-bold', active ? 'text-primary' : 'text-on-surface-variant')}>
                      {active ? <Icon name="play_circle" filled className="text-base" /> : video.position}
                    </span>
                    {video.thumbnailUrl && (
                      <img src={video.thumbnailUrl} alt="" width={96} height={54} loading="lazy" referrerPolicy="no-referrer" className="aspect-video w-24 shrink-0 rounded-xl object-cover" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={cn('line-clamp-2 text-sm font-semibold', active ? 'text-on-surface' : 'text-on-surface-variant')}>{video.title}</span>
                      {video.durationSec > 0 && <span className="text-xs text-on-surface-variant">{formatVideoDuration(video.durationSec)}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
})
