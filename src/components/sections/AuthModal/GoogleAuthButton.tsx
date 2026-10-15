import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SocialButtonShell, useMouseHover, type SocialButtonSize } from './SocialButtonShell'

// Google brand colours (brand assets are the one allowed exception to tokens).
const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']
const LETTERS = ['G', 'o', 'o', 'g', 'l', 'e']
const DOT_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853']

const TEXT: Record<SocialButtonSize, string> = { sm: 'text-base', md: 'text-lg' }

interface GoogleAuthButtonProps {
  onClick:   () => void
  disabled?: boolean
  /** "sm" = compact (sidebar sheet), "md" = default. */
  size?:     SocialButtonSize
}

/**
 * "Google" wordmark button. On mouse hover the letters take Google's colours
 * and hop in a wave, a soft blue glow fills the button, and four dots float
 * out. The dots exist only while hovered (they unmount on leave), so nothing
 * can keep looping after the mouse moves away. Reduced motion: colour only.
 */
export function GoogleAuthButton({ onClick, disabled, size = 'md' }: GoogleAuthButtonProps) {
  const { hovered, hoverHandlers } = useMouseHover(disabled)
  const reducedMotion = useReducedMotion()
  const animate = hovered && !reducedMotion

  return (
    <SocialButtonShell size={size} label="Continue with Google" onClick={onClick} disabled={disabled} hoverHandlers={hoverHandlers}>
      {/* Soft blue glow */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle, #4285F4 0%, transparent 70%)' }}
        initial={false}
        animate={{ opacity: hovered ? 0.08 : 0, scale: animate ? 4 : 1 }}
        transition={{ duration: hovered ? 0.5 : 0.3 }}
      />

      {/* Floating dots: mounted only while hovered */}
      <AnimatePresence>
        {animate && (
          <motion.span key="dots" aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            {DOT_COLORS.map((color, i) => (
              <motion.span
                key={color}
                className="absolute size-1.5 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  x: [0, i % 2 === 0 ? 38 : -38],
                  y: [0, i < 2 ? 14 : -14],
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Wordmark */}
      <span className={`relative z-10 flex items-center font-headline font-bold ${TEXT[size]}`}>
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            className="inline-block text-on-surface transition-colors duration-200"
            style={hovered ? { color: GOOGLE_COLORS[i] } : undefined}
            initial={false}
            animate={animate ? { y: [0, -5, 0], scale: [1, 1.3, 1] } : { y: 0, scale: 1 }}
            transition={{ duration: animate ? 0.5 : 0.25, delay: animate ? i * 0.06 : 0, ease: 'easeInOut' }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </SocialButtonShell>
  )
}
