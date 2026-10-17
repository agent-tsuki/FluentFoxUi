import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import type { KanaChar } from '@/types'
import { useKanaMastery } from '@/hooks/useKanaProgress'
import { CharCard } from '@/components/sections/KanaChart/CharCard'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/cn'

// Same lazy sheet as the chart page: audio + strokes load on first tap.
const KanaDetailSheet = lazy(() =>
  import('@/components/kana').then((m) => ({ default: m.KanaDetailSheet })),
)

interface UnitLearnGridProps {
  kana: KanaChar[]
  /** Called once every kana of the unit has been opened in this visit (ticks the Learn step). */
  onLearned?: () => void
}

/** Returns focus to the tile of the kana that was last open. */
function focusTile(id: string) {
  window.setTimeout(() => {
    document.querySelector<HTMLElement>(`[data-kana-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true })
  }, 0)
}

/** The unit's kana as mastery-coloured tiles; tapping opens the detail sheet, which steps through this unit only. */
export function UnitLearnGrid({ kana, onLearned }: UnitLearnGridProps) {
  const mastery = useKanaMastery()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetRequested, setSheetRequested] = useState(false)
  const [openedIds, setOpenedIds] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    if (selectedId) setOpenedIds((ids) => (ids.has(selectedId) ? ids : new Set(ids).add(selectedId)))
  }, [selectedId])

  const allOpened = kana.length > 0 && kana.every((c) => openedIds.has(c.id))
  useEffect(() => {
    if (allOpened) onLearned?.()
    // Once per visit: a new callback identity must not report again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOpened])

  // Rows of five read like the chart; compounds and 3-kana rows go three across.
  const fiveAcross = kana.length % 5 === 0 && !kana.some((c) => c.isCompound)

  const select = useCallback((char: KanaChar) => {
    setSelectedId(char.id)
    setSheetRequested(true)
  }, [])

  const index = selectedId ? kana.findIndex((c) => c.id === selectedId) : -1
  const selected = index >= 0 ? kana[index] : null
  const prev = index > 0 ? kana[index - 1] : undefined
  const next = index >= 0 && index < kana.length - 1 ? kana[index + 1] : undefined

  const close = useCallback(() => {
    if (selectedId) focusTile(selectedId)
    setSelectedId(null)
  }, [selectedId])
  const goPrev = useCallback(() => prev && setSelectedId(prev.id), [prev])
  const goNext = useCallback(() => next && setSelectedId(next.id), [next])

  return (
    <>
      <div className={cn('grid gap-2 sm:gap-4', fiveAcross ? 'grid-cols-5' : 'grid-cols-3 max-w-md')}>
        {kana.map((char) => (
          <CharCard key={char.id} char={char} size="lg" mastery={mastery(char.id)} onSelect={select} />
        ))}
      </div>

      {sheetRequested && (
        <ErrorBoundary fallback={<span hidden />}>
          <Suspense fallback={null}>
            <KanaDetailSheet
              char={selected}
              onClose={close}
              onPrev={prev ? goPrev : undefined}
              onNext={next ? goNext : undefined}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  )
}
