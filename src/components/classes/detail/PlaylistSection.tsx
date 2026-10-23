import { forwardRef } from 'react'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatVideoDuration } from '@/lib/classes/format'
import { isPlaylistId } from '@/lib/classes/youtube'
import type { ClassVideo } from '@/types/classes'
import { SectionTitle } from './SectionTitle'

interface PlaylistSectionProps {
  /** Course title, the player's accessible name in playlist-only mode. */
  title: string
  videos: ClassVideo[]
  /** Used when there is no video list: one click-to-load player for the whole playlist. */
  playlistId: string | null
  /** Poster for the playlist-only player. */
  thumbnailUrl: string | null
  channelName: string
  channelUrl: string
  selectedIndex: number
  /** The learner already pressed play once: later picks start straight away. */
  started: boolean
  onSelect: (index: number) => void
  onPlay: () => void
}

/**
 * PlaylistSection — a click-to-load YouTube player (youtube-nocookie, no
 * iframe until the learner presses play). With a video list it sits beside the
 * ordered list; with only a playlist id it is a single videoseries player.
 * The page renders it only when one of the two exists (see `hasPlayablePlaylist`).
 */
export const PlaylistSection = forwardRef<HTMLElement, PlaylistSectionProps>(function PlaylistSection(
  { title, videos, playlistId, thumbnailUrl, channelName, channelUrl, selectedIndex, started, onSelect, onPlay },
  ref,
) {
  const current = videos[selectedIndex] ?? videos[0]
  if (!current && !isPlaylistId(playlistId)) return null

  const hostedOn = (
    <p className="text-xs text-on-surface-variant">
      Videos hosted on YouTube ·{' '}
      <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-on-surface underline-offset-2 hover:underline">
        {channelName}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </p>
  )

  return (
    <section ref={ref} id="playlist" aria-labelledby="playlist-title" className="scroll-mt-28">
      <SectionTitle id="playlist-title" icon="format_list_numbered">Playlist</SectionTitle>

      {!current ? (
        <div className="max-w-3xl space-y-2">
          {/* key: `started` (hero poster / Start watching) remounts straight into the playing iframe. */}
          <VideoEmbed
            key={started ? 'on' : 'off'}
            playlistId={playlistId ?? undefined}
            posterUrl={thumbnailUrl}
            title={title}
            autoPlay={started}
            onPlay={onPlay}
          />
          {hostedOn}
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
            {hostedOn}
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
