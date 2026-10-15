import type { Transition, Variants } from 'framer-motion'

/**
 * Shared motion tokens (docs/UIUX_STANDARDS.md §7).
 * Keep motion purposeful and quiet: 150–500ms, one easing family, no loops.
 * Components gate these on `useReducedMotion()` and render the final state
 * immediately when the user prefers reduced motion.
 */

export const easings = {
  /** Soft deceleration for entrances. */
  out: [0.22, 1, 0.36, 1],
} as const

export const durations = {
  /** Content leaving (exits are quicker than entrances). */
  exit: 0.15,
  /** Content entering. */
  enter: 0.25,
  /** A container changing size to fit new content. */
  resize: 0.35,
} as const

/** Smooth size change for containers whose content swaps (e.g. auth tabs). */
export const resizeTransition: Transition = { duration: durations.resize, ease: easings.out }

/**
 * Crossfade for content keyed by a tab/step inside `<AnimatePresence mode="wait">`.
 * Old content fades out quickly, then the new content fades up.
 */
export const swapVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: durations.enter, ease: easings.out } },
  exit:    { opacity: 0, y: -8, transition: { duration: durations.exit, ease: easings.out } },
}

export const springs = {
  /** A surface rising into place (sheets, panels). Settles without bounce. */
  sheet: { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 },
} satisfies Record<string, Transition>

/** Parent that reveals its children one after another. */
export const staggerChildren = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Child that fades up a short distance. Pair with `staggerChildren`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easings.out } },
}
