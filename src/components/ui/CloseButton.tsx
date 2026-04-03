import { motion } from 'framer-motion'

interface CloseButtonProps {
  onClick: () => void
  className?: string
  'aria-label'?: string
}

export function CloseButton({ onClick, className = '', 'aria-label': ariaLabel = 'Close' }: CloseButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-error hover:bg-error-container ${className}`}
      whileHover={{ rotate: 90, scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
    >
      <span className="material-symbols-outlined text-lg">close</span>
    </motion.button>
  )
}
