import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import { useKanaScript } from '@/context/KanaScriptContext'
import { kanaSpeechText } from '@/lib/content/kana/kanaMarks'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { durations, easings, springs, swapVariants } from '@/lib/motion'
import { KanaSheetHeader } from '@/components/kana/KanaSheetHeader'
import { KanaStrokeSections } from '@/components/kana/KanaStrokeSections'
import { useSheetDialog } from '@/components/kana/useSheetDialog'
import type { KanaChar } from '@/types'

interface KanaDetailSheetProps {
  /** The kana to show; `null` closes the sheet. */
  char: KanaChar | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

const TITLE_ID = 'kana-detail-sheet-title'
/** Horizontal travel (px) that counts as a prev/next swipe. */
const SWIPE_DISTANCE = 60

const PANEL = {
  phone: 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-3xl border-t pb-[env(safe-area-inset-bottom)]',
  desktop: 'inset-y-0 right-0 w-full max-w-md rounded-l-3xl border-l',
}

/**
 * KanaDetailSheet — the "character sheet" for one kana: sound, stroke order,
 * memory hint, example word, and a trace pad. A bottom sheet on phones (drag
 * the handle down to dismiss, swipe sideways for prev/next) and a right-side
 * panel from `lg`. Accessible modal dialog; marks the kana as seen on open.
 */
export function KanaDetailSheet({ char, onClose, onPrev, onNext }: KanaDetailSheetProps) {
  const reducedMotion = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { supported, speak } = useJapaneseSpeech()
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const dragControls = useDragControls()
  const progress = useKanaProgressStore()
  const script = useKanaScript()

  const open = char !== null
  const charId = char?.id
  const trapFocus = useSheetDialog({ open, panelRef, onClose, onPrev, onNext })

  useEffect(() => {
    if (!charId) return
    progress.markSeen(charId)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [charId, progress])

  const onSwipeStart = (e: ReactPointerEvent) => {
    const onPad = (e.target as Element).closest('[data-trace-pad]')
    swipeStart.current = e.pointerType === 'touch' && !onPad ? { x: e.clientX, y: e.clientY } : null
  }
  const onSwipeEnd = (e: ReactPointerEvent) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx > 0) onPrev?.()
    else onNext?.()
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }

  const hidden = isDesktop ? { x: '100%' } : { y: '100%' }
  const fade = { duration: durations.enter, ease: easings.out }
  const say = supported ? speak : undefined

  return createPortal(
    <AnimatePresence>
      {/* AnimatePresence keeps the last render on screen while it animates out. */}
      {char && (
        <motion.div key="kana-sheet" className="fixed inset-0 z-[60]">
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
            tabIndex={-1}
            onKeyDown={trapFocus}
            drag={!isDesktop && !reducedMotion ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            initial={reducedMotion ? { opacity: 0 } : hidden}
            animate={reducedMotion ? { opacity: 1 } : { x: 0, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { ...hidden, transition: { duration: durations.resize, ease: easings.out } }}
            transition={reducedMotion ? fade : springs.sheet}
            className={cn(
              'absolute flex flex-col border-outline-variant/40 bg-surface-container-lowest text-on-surface shadow-elevation-3 outline-none',
              isDesktop ? PANEL.desktop : PANEL.phone,
            )}
          >
            {isDesktop ? (
              <div className="h-4" />
            ) : (
              // Drag handle: the whole strip above the header starts the dismiss drag.
              <div aria-hidden className="flex h-8 shrink-0 cursor-grab touch-none justify-center pt-2" onPointerDown={(e) => dragControls.start(e)}>
                <div className="h-1 w-10 rounded-full bg-outline-variant" />
              </div>
            )}
            <KanaSheetHeader
              char={char}
              titleId={TITLE_ID}
              onClose={onClose}
              onPrev={onPrev}
              onNext={onNext}
              onSpeak={supported ? () => speak(kanaSpeechText(char, script.sampleWords)) : undefined}
            />
            <div
              ref={scrollRef}
              className="custom-scrollbar mt-3 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
              onPointerDown={onSwipeStart}
              onPointerUp={onSwipeEnd}
              onPointerCancel={() => (swipeStart.current = null)}
            >
              <motion.div
                key={char.id}
                variants={reducedMotion ? undefined : swapVariants}
                initial={reducedMotion ? false : 'initial'}
                animate="animate"
              >
                <KanaStrokeSections char={char} onSpeak={say} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
