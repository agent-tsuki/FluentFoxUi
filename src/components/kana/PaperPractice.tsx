import { Icon } from '@/components/ui/Icon'
import { isKanaMark } from '@/lib/content/kana/kanaMarks'
import type { KanaChar } from '@/types'

/** How many times to write each character by hand. */
const REPS = 10

/**
 * PaperPractice — the kana dialog's nudge to write the character by hand:
 * ten times on paper, following the stroke order, saying it aloud each time
 * (hand, eyes and voice together). Marks like ー and ッ have no sound of
 * their own, so they only get the writing part.
 */
export function PaperPractice({ char }: { char: KanaChar }) {
  const sayable = !isKanaMark(char)
  return (
    <div className="flex gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <Icon name="edit_note" className="mt-0.5 shrink-0 text-2xl text-primary" />
      <div className="min-w-0 space-y-1.5">
        <p className="text-base font-semibold leading-snug text-on-surface">
          Write{' '}
          <span lang="ja" className="font-jp font-bold">
            {char.character}
          </span>{' '}
          {REPS} times on paper
        </p>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Copy the stroke order from the animation, one stroke at a time.
          {sayable && (
            <>
              {' '}
              Say “<span className="font-semibold text-on-surface">{char.romaji}</span>” out loud each time you write it. Hand,
              eyes and voice together make it stick.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
