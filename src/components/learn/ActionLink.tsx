import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2',
  outline: 'border-2 border-outline-variant/60 text-on-surface hover:bg-surface-container-low',
}

interface ActionLinkProps {
  to: string
  variant?: Variant
  className?: string
  children: ReactNode
}

/**
 * ActionLink — a router link that looks like the shared Button (same radius,
 * weight and press feedback). Use it when the action navigates rather than acts.
 */
export function ActionLink({ to, variant = 'primary', className, children }: ActionLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold transition duration-200 ease-out',
        'motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </Link>
  )
}
