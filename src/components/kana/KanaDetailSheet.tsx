import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useAuth } from '@/context/AuthContext'
import { YourProgress } from '@/components/progress/YourProgress'
import { Icon } from '@/components/ui/Icon'
import { kanaTrack } from '@/lib/learn/practiceSession'
import { kanaSpeechText } from '@/lib/content/kana/kanaMarks'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { durations, easings, swapVariants } from '@/lib/motion'
import { KanaSheetHeader } from '@/components/kana/KanaSheetHeader'
import { KanaMnemonic } from '@/components/kana/KanaMnemonic'
import { PaperPractice } from '@/components/kana/PaperPractice'
import { DIVIDER_TOP, KanaStrokeHero, Section } from '@/components/kana/KanaStrokeSections'
import { useSheetDialog } from '@/components/kana/useSheetDialog'
import type { KanaChar } from '@/types'

interface KanaDetailSheetProps {
  /** The kana to show; `null` closes the dialog. */
  char: KanaChar | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

const TITLE_ID = 'kana-detail-sheet-title'
/** Horizontal travel (px) that counts as a prev/next swipe. */
const SWIPE_DISTANCE = 60

const STEP_BUTTON = cn(
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted sm:size-12',
  'transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-ink active:scale-95',
  'outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30',
)

const PHONE_STEP = cn(
  'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm font-semibold text-ink',
  'transition-colors active:bg-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30',
)

/**
 * KanaDetailSheet — the kana dialog, centred on every screen and built around
 * the stroke order: the animation is the largest thing in it, with previous /
 * next beside it (also ←/→ keys and sideways swipes), so stepping through a
 * row replays each kana's strokes. A nudge to write it on paper (ten times,
 * saying it aloud), the memory hint, example word and the learner's progress
 * sit beside it on wide screens and below it on phones.
 * Accessible modal dialog (focus trap, Escape, scroll lock).
 */
export function KanaDetailSheet({ char, onClose, onPrev, onNext }: KanaDetailSheetProps) {
  const reducedMotion = useReducedMotion()
  const { supported, speak, loadingText } = useJapaneseSpeech()
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const script = useKanaScript()
  const { user } = useAuth()
  // Slow by default (easier to follow); kept here so the chosen speed carries over while stepping through kana.
  const [slow, setSlow] = useState(true)

  const open = char !== null
  const charId = char?.id
  const trapFocus = useSheetDialog({ open, panelRef, onClose, onPrev, onNext })

  useEffect(() => {
    if (!charId) return
    scrollRef.current?.scrollTo({ top: 0 })
  }, [charId])

  const onSwipeStart = (e: ReactPointerEvent) => {
    swipeStart.current = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null
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

  const fade = { duration: durations.enter, ease: easings.out }
  const say = supported ? speak : undefined

  return createPortal(
    <AnimatePresence>
      {/* AnimatePresence keeps the last render on screen while it animates out. */}
      {char && (
        <motion.div key="kana-dialog" className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop — bg-black (not on-surface, which flips per theme) so it always darkens. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/55"
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
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: durations.exit, ease: easings.out } }}
            transition={fade}
            // Solid in dark mode too (not the frosted glass of page cards): nothing behind competes with the strokes.
            className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-line bg-surface-raised text-ink shadow-elevation-3 outline-none dark:bg-surface-raised dark:backdrop-filter-none lg:max-h-[min(100%,46rem)] lg:max-w-4xl"
          >
            <KanaSheetHeader
              char={char}
              titleId={TITLE_ID}
              onClose={onClose}
              onSpeak={supported ? () => speak(kanaSpeechText(char, script.sampleWords)) : undefined}
              speakLoading={loadingText !== null && loadingText === kanaSpeechText(char, script.sampleWords)}
            />
            <div
              ref={scrollRef}
              className="custom-scrollbar flex-1 touch-pan-y overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:overflow-hidden"
            >
              {/* Stroke order, the focus: previous / drawing / next. Swipe sideways to step. */}
              <div
                className="relative px-4 pb-5 pt-1 sm:px-5 lg:pb-6 lg:before:absolute lg:before:inset-y-6 lg:before:right-0 lg:before:w-0.5 lg:before:rounded-full lg:before:bg-line/40 lg:before:content-['']"
                onPointerDown={onSwipeStart}
                onPointerUp={onSwipeEnd}
                onPointerCancel={() => (swipeStart.current = null)}
              >
                <div className="flex items-center gap-4">
                  {/* Beside the drawing from sm; phones get a row underneath so the drawing can use the full width. */}
                  <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous kana" className={cn(STEP_BUTTON, 'max-sm:hidden')}>
                    <Icon name="arrow_back" className="text-2xl" />
                  </button>
                  <motion.div
                    key={char.id}
                    className="min-w-0 flex-1"
                    variants={reducedMotion ? undefined : swapVariants}
                    initial={reducedMotion ? false : 'initial'}
                    animate="animate"
                  >
                    <KanaStrokeHero char={char} slow={slow} onSlowChange={setSlow} />
                  </motion.div>
                  <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next kana" className={cn(STEP_BUTTON, 'max-sm:hidden')}>
                    <Icon name="arrow_forward" className="text-2xl" />
                  </button>
                </div>
                <div className="mt-3 flex gap-3 sm:hidden">
                  <button type="button" onClick={onPrev} disabled={!onPrev} className={PHONE_STEP}>
                    <Icon name="arrow_back" className="text-xl" />
                    Previous
                  </button>
                  <button type="button" onClick={onNext} disabled={!onNext} className={PHONE_STEP}>
                    Next
                    <Icon name="arrow_forward" className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Memory hint, example and progress: below on phones, a side column (own scroll) on wide screens. */}
              <motion.div
                key={`${char.id}-notes`}
                className={cn(
                  DIVIDER_TOP,
                  // Wide screens: the divider stands upright on the stroke column's edge instead (this column scrolls).
                  'custom-scrollbar lg:overflow-y-auto lg:overscroll-contain lg:before:hidden',
                )}
                variants={reducedMotion ? undefined : swapVariants}
                initial={reducedMotion ? false : 'initial'}
                animate="animate"
              >
                <Section title="Practise on paper">
                  <PaperPractice char={char} />
                </Section>
                <Section title="Remember it">
                  <KanaMnemonic char={char} onSpeak={say} loadingText={loadingText} />
                </Section>
                {user?.emailVerified && (
                  <Section title="Your progress">
                    <YourProgress itemType="kana" id={char.character} track={kanaTrack(script.id)} />
                  </Section>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
