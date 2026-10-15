import { useEffect, useState, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type SocialButtonSize = 'sm' | 'md'

/**
 * Fixed heights, so Google and X are always exactly the same size no matter
 * what they contain (a word vs. an icon).
 */
const HEIGHT: Record<SocialButtonSize, string> = {
  sm: 'h-10',
  md: 'h-12',
}

/**
 * Mouse-only hover state. Touch and pen never set it, so a tap can't leave a
 * button stuck in its hover look. Resets when the button becomes disabled.
 */
export function useMouseHover(disabled = false) {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (disabled) setHovered(false)
  }, [disabled])

  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled && e.pointerType === 'mouse') setHovered(true)
  }
  const onPointerLeave = () => setHovered(false)

  return { hovered, hoverHandlers: { onPointerEnter, onPointerLeave } }
}

interface SocialButtonShellProps {
  size:          SocialButtonSize
  label:         string
  onClick:       () => void
  disabled?:     boolean
  hoverHandlers: ReturnType<typeof useMouseHover>['hoverHandlers']
  children:      ReactNode
}

/** The shared frame for the social sign-in buttons: same height, border, radius and focus ring. */
export function SocialButtonShell({ size, label, onClick, disabled, hoverHandlers, children }: SocialButtonShellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      {...hoverHandlers}
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden rounded-xl select-none',
        'border border-surface-container-high bg-surface-container-lowest',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary',
        HEIGHT[size],
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}
