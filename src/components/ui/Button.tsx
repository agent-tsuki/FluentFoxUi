import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'white' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` is the one next step on a screen; `secondary` a real alternative; `ghost` skip, back or cancel. */
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const SECONDARY = 'border-line-strong bg-surface-raised text-ink hover:bg-surface-hover'
const PRIMARY = 'border-transparent bg-primary text-on-primary hover:bg-primary-hover'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: PRIMARY,
  secondary: SECONDARY,
  ghost: 'border-transparent text-ink hover:bg-surface-hover',
  // Older names for the two above, kept so existing call sites read the same.
  outline: SECONDARY,
  inverse: PRIMARY,
  // For use on a surface-inverse band.
  white: 'border-transparent bg-surface-raised text-primary-ink hover:bg-surface-hover',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-caption',
  md: 'min-h-touch-target px-[1.125rem] text-label',
  lg: 'min-h-[3.25rem] px-6 text-body font-semibold',
}

/** The Button recipe, for anything that must look like one (see ButtonLink). */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    // A caller's `flex` (for centring with mx-auto, or full width) must win over the inline default.
    /(^|\s)flex(\s|$)/.test(className ?? '') ? undefined : 'inline-flex',
    'items-center justify-center gap-2 rounded-md border font-sans font-semibold transition-colors duration-fast',
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-sunken disabled:text-ink-subtle',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  )
}
