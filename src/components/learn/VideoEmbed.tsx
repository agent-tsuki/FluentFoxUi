import { useCallback, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { IS_DEV } from '@/lib/config'
import { cn } from '@/lib/cn'

export interface VideoEmbedProps {
  youtubeId: string
  /** Accessible title for the player, e.g. "か row video lesson". */
  title: string
  credit?: string
  /** Called once when the learner starts the video. */
  onPlay?: () => void
}

/** YouTube ids are exactly 11 URL-safe base64 characters. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

const IFRAME_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

/**
 * VideoEmbed — a "click to load" YouTube player for lesson videos.
 *
 * Until the learner presses play it is just a lazy thumbnail and a button:
 * no YouTube scripts, cookies or third-party requests beyond the image. The
 * click swaps in a privacy-enhanced (youtube-nocookie.com) iframe that
 * autoplays. The production CSP allows that origin in `frame-src` (vite.config.ts).
 */
export function VideoEmbed({ youtubeId, title, credit, onPlay }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)

  const play = useCallback(() => {
    if (playing) return
    setPlaying(true)
    onPlay?.()
  }, [playing, onPlay])

  // The id ends up in URLs; refuse anything that isn't a real video id.
  if (!YOUTUBE_ID.test(youtubeId)) {
    if (IS_DEV) console.warn(`VideoEmbed: invalid YouTube id "${youtubeId}"`)
    return null
  }

  return (
    <figure className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-container-high shadow-elevation-1">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow={IFRAME_ALLOW}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={play}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              width={480}
              height={360}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* surface-inverse is dark in both themes, so the scrim reads the same in light and dark. */}
            <span aria-hidden="true" className="absolute inset-0 bg-surface-inverse/20" />
            {/* play_circle (filled) is in the app's subset icon font; play_arrow isn't. The on-primary
                disc behind it fills the cut-out triangle so it reads as a solid button on any thumbnail. */}
            <span
              aria-hidden="true"
              className={cn(
                'relative flex items-center justify-center text-primary drop-shadow-lg',
                'transition-transform duration-200 group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100',
              )}
            >
              <span className="absolute h-10 w-10 rounded-full bg-on-primary sm:h-12 sm:w-12" />
              <Icon name="play_circle" filled className="relative text-7xl sm:text-8xl" />
            </span>
          </button>
        )}
      </div>
      {credit && <figcaption className="mt-2 text-xs text-on-surface-variant">{credit}</figcaption>}
    </figure>
  )
}
