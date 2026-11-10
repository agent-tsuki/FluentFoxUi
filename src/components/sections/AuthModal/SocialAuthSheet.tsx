import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeUp, springs, staggerChildren } from '@/lib/motion'
import { ArcEdge } from './ArcEdge'
import { SocialAuthButtons } from './SocialAuthButtons'
import type { SocialButtonSize } from './SocialButtonShell'

interface SocialAuthSheetProps {
  onGoogle: () => void
  onX: () => void
  /** Sign up: its taller sidebar has room for a taller sheet. */
  tall?: boolean
}

const contentVariants = staggerChildren(0.08, 0.25)

// ── Tweak here for manual testing ─────────────────────────────────────────────
// Use full Tailwind class names (Tailwind only sees complete strings).

/** Text shown above the Google / X buttons. */
const LABEL_TEXT = 'Continue with'

/**
 * Space between the curved top edge and the label.
 * Smaller = label sits higher. Try: 'pt-0', 'pt-1', 'pt-2', 'pt-4' (original).
 */
const LABEL_TOP_SPACE = 'pt-3'
/** LABEL_TOP_SPACE on sign up: with SHEET_BOTTOM_SPACE_TALL it centres the label and buttons in the taller sheet. */
const LABEL_TOP_SPACE_TALL = 'pt-9'

/**
 * Pulls the label further up, into the white curve itself.
 * More negative = higher. Try: '' (none), '-mt-1', '-mt-2', '-mt-3'.
 */
const LABEL_LIFT = '-mt-6'

/** Space between the label and the buttons. Try: 'mb-2', 'mb-3', 'mb-4'. */
const LABEL_BOTTOM_SPACE = 'mb-4'

/** Height of the curved top edge. Taller = rounder curve. Try: 'h-4', 'h-6', 'h-8'. */
const ARC_HEIGHT = 'h-12'

/** Google / X button size here. 'sm' = compact, 'md' = original. */
const BUTTON_SIZE: SocialButtonSize = 'sm'

/** Space under the buttons (bottom of the panel). Try: 'pb-6', 'pb-8' (original). */
const SHEET_BOTTOM_SPACE = 'pb-9'
/** SHEET_BOTTOM_SPACE on sign up, whose sidebar is taller: the sheet rises higher. */
const SHEET_BOTTOM_SPACE_TALL = 'pb-14'
// ──────────────────────────────────────────────────────────────────────────────

/**
 * SocialAuthSheet — a light surface with a circular top edge that rises out of
 * the bottom of the orange auth sidebar and holds the Google / X buttons.
 *
 * Motion: the sheet springs up from below the panel (clipped by the sidebar's
 * overflow-hidden), then the label and buttons fade up one after another.
 * Under prefers-reduced-motion everything renders in its final state.
 */
export function SocialAuthSheet({ onGoogle, onX, tall = false }: SocialAuthSheetProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { y: '110%' }}
      animate={{ y: 0 }}
      transition={{ ...springs.sheet, delay: 0.1 }}
      // Solid in dark too: the theme's see-through glass would let the orange sidebar show under the (solid) arc.
      className={`relative -mx-10 -mb-10 mt-10 bg-surface-raised px-8 text-ink dark:bg-surface-raised dark:backdrop-filter-none ${tall ? `${LABEL_TOP_SPACE_TALL} ${SHEET_BOTTOM_SPACE_TALL}` : `${LABEL_TOP_SPACE} ${SHEET_BOTTOM_SPACE}`}`}
    >
      <ArcEdge fillClassName="fill-surface-raised" className={ARC_HEIGHT} />

      <motion.div
        variants={contentVariants}
        initial={reducedMotion ? false : 'hidden'}
        animate="visible"
      >
        <motion.p
          variants={fadeUp}
          className={`relative z-10 ${LABEL_LIFT} ${LABEL_BOTTOM_SPACE} text-center text-2xs font-bold uppercase tracking-[0.12em] text-ink-muted`}
        >
          {LABEL_TEXT}
        </motion.p>
        <SocialAuthButtons onGoogle={onGoogle} onX={onX} animated size={BUTTON_SIZE} />
      </motion.div>
    </motion.div>
  )
}
