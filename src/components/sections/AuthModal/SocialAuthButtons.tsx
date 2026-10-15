import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { GoogleAuthButton } from './GoogleAuthButton'
import { XAuthButton } from './XAuthButton'

interface SocialAuthButtonsProps {
  onGoogle: () => void
  onX: () => void
  disabled?: boolean
  /** Animate each button with the parent's stagger (`fadeUp` variants). */
  animated?: boolean
}

/**
 * SocialAuthButtons — Google and X stacked full width.
 * Shared by the desktop sidebar sheet and the mobile auth screen so both
 * render the exact same controls.
 */
export function SocialAuthButtons({ onGoogle, onX, disabled, animated = false }: SocialAuthButtonsProps) {
  const variants = animated ? fadeUp : undefined
  return (
    <div className="grid gap-2.5">
      <motion.div variants={variants} className="flex">
        <GoogleAuthButton onClick={onGoogle} disabled={disabled} />
      </motion.div>
      <motion.div variants={variants} className="flex">
        <XAuthButton onClick={onX} disabled={disabled} />
      </motion.div>
    </div>
  )
}
