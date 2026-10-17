import type { KanaChar } from '@/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

interface ListenPromptProps {
  target: KanaChar
  speechSupported: boolean
  /** null while waiting for an answer. */
  result: 'correct' | 'wrong' | null
  onReplay: () => void
}

/**
 * The round's prompt: a replay button (or the romaji when the browser can't
 * speak), plus a fixed-height feedback line so answering doesn't shift layout.
 * The element marked `data-round-focus` takes focus at the start of a round.
 */
export function ListenPrompt({ target, speechSupported, result, onReplay }: ListenPromptProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
      {speechSupported ? (
        <>
          <button
            data-round-focus
            type="button"
            onClick={onReplay}
            aria-label="Play the sound again"
            className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-150 hover:bg-primary/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Icon name="volume_up" className="text-5xl" />
          </button>
          <p className="text-sm text-on-surface-variant">
            Which kana did you hear? <span className="hidden sm:inline">Press R to replay.</span>
          </p>
        </>
      ) : (
        <>
          <p data-round-focus tabIndex={-1} className="font-headline text-6xl font-extrabold text-primary focus:outline-none">
            <span className="sr-only">Which kana is </span>
            {target.romaji}
          </p>
          <p className="max-w-xs text-xs text-on-surface-variant">
            Audio isn’t available in this browser, so the reading is shown instead.
          </p>
        </>
      )}
      <p aria-hidden="true" className={cn('h-7 font-bold', result === 'correct' ? 'text-success' : 'text-on-surface')}>
        {result === 'correct' && 'Correct!'}
        {result === 'wrong' && (
          <>
            It was <span lang="ja" className="font-jp">{target.character}</span> ({target.romaji})
          </>
        )}
      </p>
    </div>
  )
}
