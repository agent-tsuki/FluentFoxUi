import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { StrokeOrder } from '@/components/kana/StrokeOrder'
import { useKanaStrokes } from '@/components/kana/useKanaStrokes'
import type { KanaChar } from '@/types'

/**
 * Divider between blocks: inset from the panel's edges, with rounded ends
 * (a 2 px pill), rather than a full-width rule.
 */
export const DIVIDER_TOP =
  "relative before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:rounded-full before:bg-line/40 before:content-['']"

/** One titled block of the kana dialog's side column. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={`${DIVIDER_TOP} px-5 py-5 first:before:hidden`}>
      <h3>
        <Eyebrow>{title}</Eyebrow>
      </h3>
      {children}
    </section>
  )
}

interface KanaStrokeHeroProps {
  char: KanaChar
  /** Slow drawing, kept by the dialog so it carries over to the next kana. */
  slow: boolean
  onSlowChange: (slow: boolean) => void
}

/** Drawing size: as large as the dialog allows, but never taller than the screen leaves room for. */
const HERO_SIZE = 'max-w-[min(100%,22rem,calc(100dvh-20rem))] lg:max-w-[min(100%,26rem,calc(100dvh-16rem))]'

/**
 * KanaStrokeHero — the kana dialog's main block: the stroke-order animation,
 * large. Stroke data is a lazy chunk shared by the whole chart, so after the
 * first kana every other one is ready immediately.
 */
export function KanaStrokeHero({ char, slow, onSlowChange }: KanaStrokeHeroProps) {
  const strokes = useKanaStrokes(char.character)

  switch (strokes.status) {
    case 'loading':
      return (
        <LoadingState label="Loading strokes…">
          <SkeletonBlock className={`mx-auto aspect-square w-full rounded-xl ${HERO_SIZE}`} />
        </LoadingState>
      )
    case 'error':
      return <ErrorState title="Couldn't load strokes" message="Check your connection and try again." onRetry={strokes.retry} className="py-6" />
    case 'missing':
      return <p className="py-10 text-center text-sm text-ink-muted">Stroke data isn't available for this character yet.</p>
    case 'ready':
      return (
        // No backdrop blur under the drawing: it sits on the dialog's solid panel, and a blur would be recomputed while strokes animate.
        <div className={`mx-auto w-full ${HERO_SIZE}`}>
          <StrokeOrder glyph={strokes.glyph} character={char.character} className="max-w-none dark:backdrop-filter-none" slow={slow} onSlowChange={onSlowChange} />
        </div>
      )
  }
}
