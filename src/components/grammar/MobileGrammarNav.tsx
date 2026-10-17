import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GrammarChapterSummary } from '@/types/grammar'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { useMeasuredHeight } from '@/hooks/useMeasuredHeight'
import { LevelSwitcher } from '@/components/grammar/LevelSwitcher'
import { ChapterSheet } from '@/components/grammar/ChapterSheet'

interface MobileGrammarNavProps {
  level: string
  chapters: GrammarChapterSummary[]
  completedChapters: Set<number>
  activeChapterId: number
  prevChapterId?: number
  nextChapterId?: number
}

// Hover styles only on hover-capable devices so a tap doesn't leave a stuck state.
const ICON_BUTTON =
  'size-11 shrink-0 inline-flex items-center justify-center rounded-full text-on-surface-variant ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors ' +
  '[@media(hover:hover)]:enabled:hover:bg-surface-container-high [@media(hover:hover)]:enabled:hover:text-on-surface ' +
  'disabled:opacity-35 disabled:cursor-not-allowed'

/**
 * MobileGrammarNav — phone/tablet (< lg) replacement for GrammarSidebar.
 * Sticks directly under the fixed navbar and holds the level switcher,
 * a "Chapter X of N" button that opens the ChapterSheet, and prev/next buttons.
 */
export function MobileGrammarNav({
  level,
  chapters,
  completedChapters,
  activeChapterId,
  prevChapterId,
  nextChapterId,
}: MobileGrammarNavProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { ref: barRef, height: barHeight } = useMeasuredHeight<HTMLDivElement>()
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  // Any route change (level/chapter) closes the sheet.
  useEffect(() => setSheetOpen(false), [level, activeChapterId])

  const position = chapters.findIndex(c => c.id === activeChapterId) + 1
  const goTo = (id?: number) => id !== undefined && navigate(`/grammar/${level}/${id}`)

  return (
    // The bar is `fixed` (not `sticky`): the App root's `overflow-x-hidden` makes it the
    // sticky containing block, so `sticky` would never stick. This in-flow wrapper
    // reserves the bar's measured height so page content starts below it.
    <div className="lg:hidden flex-shrink-0" style={{ height: barHeight }}>
      <div
        ref={barRef}
        className="fixed inset-x-0 top-nav z-30 flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/40 shadow-elevation-1"
      >
        <LevelSwitcher level={level} size="md" className="sm:w-64 sm:flex-shrink-0" />

        {chapters.length > 0 && (
          <div className="flex items-center gap-1 sm:flex-1 sm:justify-end">
            <button
              type="button"
              onClick={() => goTo(prevChapterId)}
              disabled={prevChapterId === undefined}
              aria-label="Previous chapter"
              className={ICON_BUTTON}
            >
              {/* chevron_left isn't in the icon-font subset (index.html), so mirror chevron_right. */}
              <Icon name="chevron_right" className="text-2xl rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className={cn(
                'flex-1 sm:flex-none min-h-11 min-w-0 inline-flex items-center justify-center gap-1 px-4 rounded-full',
                'bg-surface-container-high text-sm font-bold text-on-surface',
                'outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors',
                '[@media(hover:hover)]:hover:bg-surface-container-highest',
              )}
            >
              <span className="truncate">
                Chapter {position > 0 ? position : 1} of {chapters.length}
              </span>
              <Icon name="expand_more" className="text-xl text-on-surface-variant" />
            </button>

            <button
              type="button"
              onClick={() => goTo(nextChapterId)}
              disabled={nextChapterId === undefined}
              aria-label="Next chapter"
              className={ICON_BUTTON}
            >
              <Icon name="chevron_right" className="text-2xl" />
            </button>
          </div>
        )}
      </div>

      <ChapterSheet
        open={sheetOpen}
        onClose={closeSheet}
        level={level}
        chapters={chapters}
        completedChapters={completedChapters}
        activeChapterId={activeChapterId}
      />
    </div>
  )
}
