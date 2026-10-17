import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { durations, easings } from '@/lib/motion'

const CelebrationFox = lazy(() => import('./CelebrationFox').then((m) => ({ default: m.CelebrationFox })))

/** The fox plays for ~2 s; the toast stays a beat longer so it can be read. */
const VISIBLE_MS = 2600
const VISIBLE_MS_REDUCED = 3500

interface RowCelebrationProps {
  message: string | null
  onDismiss: () => void
}

/**
 * A short, one-off "row learned" toast with the happy fox. Tap it or press
 * Escape to skip; under reduced motion it is just the message.
 */
export function RowCelebration({ message, onDismiss }: RowCelebrationProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, reducedMotion ? VISIBLE_MS_REDUCED : VISIBLE_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [message, onDismiss, reducedMotion])

  return (
    <>
      {/* Always mounted so screen readers pick up the change. */}
      <div aria-live="polite" className="sr-only">
        {message ?? ''}
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            key="row-celebration"
            onClick={onDismiss}
            className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-sm cursor-pointer items-center gap-3 rounded-2xl border border-primary/30 bg-surface-container-lowest p-3 pr-2 text-left shadow-elevation-3"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: durations.enter, ease: easings.out } }}
            exit={{ opacity: 0, transition: { duration: durations.exit } }}
          >
            {reducedMotion ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon name="celebration" className="text-2xl text-primary" />
              </span>
            ) : (
              <span className="-my-2 shrink-0">
                <Suspense fallback={<span className="block h-[72px] w-[72px]" />}>
                  <CelebrationFox size={72} />
                </Suspense>
              </span>
            )}
            <p aria-hidden className="flex-1 font-headline text-base font-bold text-on-surface">{message}</p>
            <CloseButton onClick={onDismiss} aria-label="Dismiss celebration" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
