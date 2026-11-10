import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { durations, easings } from '@/lib/motion'
import { PracticeShellFill } from '@/components/practice/PracticeShell'
import { useSheetDialog } from '@/components/kana/useSheetDialog'

const noop = () => {}

interface SessionDialogProps {
  open: boolean
  /** Accessible name, e.g. "か row quiz". */
  label: string
  onClose: () => void
  /** False while a graded quiz runs: clicking outside and Escape then do nothing (its own ✕ asks first). */
  dismissable?: boolean
  children: ReactNode
}

/**
 * A quiz or practice session as a popup over the Learn page, so finishing or
 * leaving it lands back on the same open row. Full screen on phones, a
 * centred panel from `sm`. Modal: focus trap, Escape, scroll lock. Practice
 * shells inside size to the popup instead of the screen.
 */
export function SessionDialog({ open, label, onClose, dismissable = true, children }: SessionDialogProps) {
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const dismiss = dismissable ? onClose : noop
  const trapFocus = useSheetDialog({ open, panelRef, onClose: dismiss })
  const fade = { duration: durations.enter, ease: easings.out }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="session-dialog" className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/55"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: durations.exit } }}
            transition={fade}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={trapFocus}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: durations.exit, ease: easings.out } }}
            transition={fade}
            className="relative flex w-full flex-col overflow-y-auto overscroll-contain bg-surface-raised text-ink shadow-elevation-3 outline-none dark:bg-surface-raised dark:backdrop-filter-none sm:max-h-[min(100%,48rem)] sm:max-w-xl sm:rounded-3xl sm:border sm:border-line"
          >
            <PracticeShellFill.Provider value={false}>{children}</PracticeShellFill.Provider>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
