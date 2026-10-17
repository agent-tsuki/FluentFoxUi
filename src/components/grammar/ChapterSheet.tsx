import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { GrammarChapterSummary } from '@/types/grammar'
import { CloseButton } from '@/components/ui/CloseButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { durations, easings, springs } from '@/lib/motion'
import { ChapterProgress } from '@/components/grammar/ChapterProgress'
import { ChapterList } from '@/components/grammar/ChapterList'

interface ChapterSheetProps {
  open: boolean
  onClose: () => void
  level: string
  chapters: GrammarChapterSummary[]
  completedChapters: Set<number>
  activeChapterId: number
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const TITLE_ID = 'grammar-chapter-sheet-title'

/**
 * ChapterSheet — phone bottom sheet listing a level's chapters.
 * Accessible dialog: initial focus on the active chapter, Tab is trapped,
 * Escape / backdrop / picking a chapter close it, body scroll is locked, and
 * focus returns to the trigger on close. Rendered in a portal so it sits above
 * the fixed navbar. Slides up with springs.sheet; fades only under reduced motion.
 */
export function ChapterSheet({ open, onClose, level, chapters, completedChapters, activeChapterId }: ChapterSheetProps) {
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  // Body scroll lock + Escape + focus management while open.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)

    // Wait a frame so the portal content is mounted before focusing.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const active = panel.querySelector<HTMLElement>('[data-active]')
      ;(active ?? panel.querySelector<HTMLElement>(FOCUSABLE))?.focus()
      active?.scrollIntoView({ block: 'center' })
    })

    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  // Keep Tab / Shift+Tab inside the sheet.
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const fade = { duration: durations.enter, ease: easings.out }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="chapter-sheet" className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop — bg-black (not on-surface, which flips per theme) so it always darkens. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: durations.exit } }}
            transition={fade}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            onKeyDown={trapFocus}
            initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%', transition: { duration: durations.resize, ease: easings.out } }}
            transition={reducedMotion ? fade : springs.sheet}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] flex flex-col bg-surface-container-lowest text-on-surface rounded-t-3xl border-t border-outline-variant/40 shadow-elevation-3 pb-[env(safe-area-inset-bottom)]"
          >
            <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-outline-variant/60" />
            <div className="flex items-center justify-between gap-3 pl-5 pr-2 pt-1">
              <h2 id={TITLE_ID} className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                {level.toUpperCase()} Chapters
              </h2>
              <CloseButton onClick={onClose} aria-label="Close chapter list" />
            </div>
            <ChapterProgress
              chapters={chapters}
              completedChapters={completedChapters}
              className="px-5 pt-1 border-b border-outline-variant/20 flex-shrink-0"
            />
            <nav aria-label={`${level.toUpperCase()} chapters`} className="flex-1 overflow-y-auto overscroll-contain py-2 custom-scrollbar">
              <ChapterList
                level={level}
                chapters={chapters}
                completedChapters={completedChapters}
                activeChapterId={activeChapterId}
                onSelect={onClose}
              />
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
