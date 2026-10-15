import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeUp, springs, staggerChildren } from '@/lib/motion'
import { ArcEdge } from './ArcEdge'
import { SocialAuthButtons } from './SocialAuthButtons'

interface SocialAuthSheetProps {
  onGoogle: () => void
  onX: () => void
}

const contentVariants = staggerChildren(0.08, 0.25)

/**
 * SocialAuthSheet — a light surface with a circular top edge that rises out of
 * the bottom of the orange auth sidebar and holds the Google / X buttons.
 *
 * Motion: the sheet springs up from below the panel (clipped by the sidebar's
 * overflow-hidden), then the label and buttons fade up one after another.
 * Under prefers-reduced-motion everything renders in its final state.
 */
export function SocialAuthSheet({ onGoogle, onX }: SocialAuthSheetProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { y: '110%' }}
      animate={{ y: 0 }}
      transition={{ ...springs.sheet, delay: 0.1 }}
      className="relative -mx-10 -mb-10 mt-10 bg-surface-container-lowest px-8 pb-8 pt-4 text-on-surface"
    >
      <ArcEdge fillClassName="fill-surface-container-lowest" className="h-6" />

      <motion.div
        variants={contentVariants}
        initial={reducedMotion ? false : 'hidden'}
        animate="visible"
      >
        <motion.p
          variants={fadeUp}
          className="mb-3 text-center text-2xs font-bold uppercase tracking-widest text-on-surface-variant"
        >
          Continue with
        </motion.p>
        <SocialAuthButtons onGoogle={onGoogle} onX={onX} animated />
      </motion.div>
    </motion.div>
  )
}
