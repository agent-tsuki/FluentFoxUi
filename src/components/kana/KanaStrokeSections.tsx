import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { StrokeOrder } from '@/components/kana/StrokeOrder'
import { TracePad } from '@/components/kana/TracePad'
import { KanaMnemonic } from '@/components/kana/KanaMnemonic'
import { useKanaStrokes } from '@/components/kana/useKanaStrokes'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import type { KanaChar } from '@/types'

interface KanaStrokeSectionsProps {
  char: KanaChar
  /** Speech callback; omitted when the browser has no Japanese voice. */
  onSpeak?: (text: string) => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="border-t border-outline-variant/40 px-5 py-5">
      <h3>
        <Eyebrow>{title}</Eyebrow>
      </h3>
      {children}
    </section>
  )
}

/**
 * KanaStrokeSections — the sheet body: stroke order, memory hint, trace pad.
 * Stroke data is a lazy chunk, so both stroke sections share one load state;
 * the trace section only appears once strokes are ready.
 */
export function KanaStrokeSections({ char, onSpeak }: KanaStrokeSectionsProps) {
  const strokes = useKanaStrokes(char.character)
  const progress = useKanaProgressStore()

  const strokeOrder = (): ReactNode => {
    switch (strokes.status) {
      case 'loading':
        return (
          <LoadingState label="Loading strokes…">
            <SkeletonBlock className="mx-auto aspect-square w-full max-w-[15rem] rounded-2xl" />
          </LoadingState>
        )
      case 'error':
        return <ErrorState title="Couldn't load strokes" message="Check your connection and try again." onRetry={strokes.retry} className="py-6" />
      case 'missing':
        return <p className="text-sm text-on-surface-variant">Stroke data isn't available for this character yet.</p>
      case 'ready':
        return <StrokeOrder glyph={strokes.glyph} character={char.character} />
    }
  }

  return (
    <>
      <Section title="Stroke order">{strokeOrder()}</Section>
      <Section title="Remember it">
        <KanaMnemonic char={char} onSpeak={onSpeak} />
      </Section>
      {strokes.status === 'ready' && (
        <Section title="Trace it">
          <TracePad glyph={strokes.glyph} onComplete={() => progress.markTraced(char.id)} />
        </Section>
      )}
    </>
  )
}
