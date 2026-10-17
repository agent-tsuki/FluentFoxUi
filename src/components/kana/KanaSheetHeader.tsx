import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { isKanaMark, kanaReadingLabel } from '@/lib/content/kana/kanaMarks'
import type { KanaChar } from '@/types'

interface KanaSheetHeaderProps {
  char: KanaChar
  titleId: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  onSpeak?: () => void
}

const NAV_BUTTON = cn(
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant',
  'transition-colors hover:bg-surface-container-high hover:text-on-surface',
  'outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 disabled:hover:bg-transparent',
)

/** KanaSheetHeader — big character, romaji, play button, and prev/next/close. */
export function KanaSheetHeader({ char, titleId, onClose, onPrev, onNext, onSpeak }: KanaSheetHeaderProps) {
  return (
    <header className="flex items-center gap-1 px-2">
      <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous kana" className={NAV_BUTTON}>
        <Icon name="arrow_back" className="text-2xl" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
        <h2 id={titleId} className="flex items-baseline gap-3">
          <span lang="ja" className="font-jp text-6xl font-bold leading-none text-on-surface">
            {char.character}
          </span>
          {isKanaMark(char) ? (
            <span className="font-headline text-lg font-semibold text-on-surface-variant">
              <span className="sr-only">, </span>
              {kanaReadingLabel(char)}
            </span>
          ) : (
            <span className="font-headline text-2xl font-semibold text-on-surface-variant">
              <span className="sr-only">, romaji </span>
              {char.romaji}
            </span>
          )}
        </h2>
        {onSpeak && <SpeakerButton onClick={onSpeak} />}
      </div>

      <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next kana" className={NAV_BUTTON}>
        <Icon name="arrow_forward" className="text-2xl" />
      </button>
      <CloseButton onClick={onClose} aria-label="Close kana details" />
    </header>
  )
}
