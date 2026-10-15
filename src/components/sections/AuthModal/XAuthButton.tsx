import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SocialButtonShell, useMouseHover, type SocialButtonSize } from './SocialButtonShell'

const ICON_PX: Record<SocialButtonSize, number> = { sm: 18, md: 22 }

interface XAuthButtonProps {
  onClick:   () => void
  disabled?: boolean
  /** "sm" = compact (sidebar sheet), "md" = default. */
  size?:     SocialButtonSize
}

/**
 * X logo button. On mouse hover the button fills with X's black and the logo
 * turns white and springs up slightly. Colours follow the theme through
 * tokens (no theme watcher needed). Reduced motion: no scaling.
 */
export function XAuthButton({ onClick, disabled, size = 'md' }: XAuthButtonProps) {
  const { hovered, hoverHandlers } = useMouseHover(disabled)
  const reducedMotion = useReducedMotion()
  const px = ICON_PX[size]

  return (
    <SocialButtonShell size={size} label="Continue with X" onClick={onClick} disabled={disabled} hoverHandlers={hoverHandlers}>
      {/* X brand black fill */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        width={px}
        height={px}
        className={`relative z-10 fill-current transition-colors duration-200 ${hovered ? 'text-white' : 'text-on-surface'}`}
        initial={false}
        animate={{ scale: hovered && !reducedMotion ? 1.3 : 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L3.283 2.25H9.59l4.258 5.658Zm-1.161 16.81h1.833L7.084 4.126H5.117Z" />
      </motion.svg>
    </SocialButtonShell>
  )
}
