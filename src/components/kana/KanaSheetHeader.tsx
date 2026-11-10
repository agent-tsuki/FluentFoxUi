import { CloseButton } from '@/components/ui/CloseButton'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { isKanaMark, kanaReadingLabel } from '@/lib/content/kana/kanaMarks'
import type { KanaChar } from '@/types'

interface KanaSheetHeaderProps {
  char: KanaChar
  titleId: string
  onClose: () => void
  onSpeak?: () => void
  /** The sound is still loading: the speaker shows a spinner. */
  speakLoading?: boolean
}

/**
 * KanaSheetHeader — the kana dialog's title row: the character, its reading
 * and a play button, with close at the end. Previous / next live beside the
 * stroke drawing.
 */
export function KanaSheetHeader({ char, titleId, onClose, onSpeak, speakLoading }: KanaSheetHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-5 pb-3 pt-4">
      <h2 id={titleId} className="flex min-w-0 items-baseline gap-3">
        <span lang="ja" className="font-ja-display text-5xl font-bold leading-none text-ink">
          {char.character}
        </span>
        {isKanaMark(char) ? (
          <span className="font-display text-lg font-semibold text-ink-muted">
            <span className="sr-only">, </span>
            {kanaReadingLabel(char)}
          </span>
        ) : (
          <span className="font-display text-2xl font-semibold text-ink-muted">
            <span className="sr-only">, romaji </span>
            {char.romaji}
          </span>
        )}
      </h2>
      {onSpeak && <SpeakerButton onClick={onSpeak} loading={speakLoading} />}
      <CloseButton onClick={onClose} aria-label="Close kana details" className="-mr-2 ml-auto" />
    </header>
  )
}
