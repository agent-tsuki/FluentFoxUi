import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * - `plain`    — on light surfaces (modals, panels). Default.
 * - `floating` — over mixed or scrolling content on phones: a persistent chip
 *                below `md`, plain from `md` up.
 * - `inverse`  — on a dark backdrop (full-screen overlays).
 */
export type CloseButtonVariant = 'plain' | 'floating' | 'inverse'

interface CloseButtonProps {
  onClick: () => void
  variant?: CloseButtonVariant
  className?: string
  'aria-label'?: string
}

const toneClasses: Record<CloseButtonVariant, { icon: string; circle: string; chip?: string }> = {
  plain:    { icon: 'text-on-surface-variant group-hover:text-on-surface', circle: 'bg-surface-container-high' },
  floating: {
    icon:   'text-on-surface-variant group-hover:text-on-surface',
    circle: 'bg-surface-container-high',
    chip:   'bg-surface-container-lowest/90 shadow-elevation-1 backdrop-blur-sm md:hidden',
  },
  inverse:  { icon: 'text-on-surface-inverse-variant group-hover:text-on-surface-inverse', circle: 'bg-on-surface-inverse/15' },
}

// The hover circle grows in from the centre, and the X turns a quarter.
const circleVariants: Variants = {
  rest:  { scale: 0.5, opacity: 0 },
  hover: { scale: 1, opacity: 1 },
}
const iconVariants: Variants = {
  rest:  { rotate: 0 },
  hover: { rotate: 90 },
}
const spring = { type: 'spring', stiffness: 380, damping: 24 } as const

/**
 * CloseButton — the one close control used everywhere.
 *
 * Sizes are the same on every screen: a 24px X inside a 44px tap target.
 * The X is inline SVG (not the icon font) so it is crisp and never renders as
 * the word "close" while the font loads.
 * The visible hover circle is compact (32px on desktop, 36px on phones) so it
 * never dominates the corner. Motion: circle scales in, X rotates 90°, press
 * squeezes slightly. Rotation and scaling are dropped under reduced motion.
 */
export function CloseButton({
  onClick,
  variant = 'plain',
  className,
  'aria-label': ariaLabel = 'Close',
}: CloseButtonProps) {
  const reducedMotion = useReducedMotion()
  const tone = toneClasses[variant]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={reducedMotion ? undefined : { scale: 0.9 }}
      transition={spring}
      className={cn(
        'group relative inline-flex size-11 shrink-0 items-center justify-center rounded-full',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      {/* Persistent chip (floating variant, phones only) */}
      {tone.chip && <span aria-hidden className={cn('absolute size-10 rounded-full', tone.chip)} />}

      {/* Hover circle */}
      <motion.span
        aria-hidden
        variants={reducedMotion ? { rest: { opacity: 0 }, hover: { opacity: 1 } } : circleVariants}
        transition={spring}
        className={cn('absolute size-9 rounded-full md:size-8', tone.circle)}
      />

      {/* The X */}
      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        variants={reducedMotion ? undefined : iconVariants}
        transition={spring}
        className={cn('relative size-6 transition-colors', tone.icon)}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </motion.svg>
    </motion.button>
  )
}
