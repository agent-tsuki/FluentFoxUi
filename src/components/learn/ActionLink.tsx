import type { MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/Button'

interface ActionLinkProps {
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  /** E.g. useReviewGate's check before navigating. */
  onClick?: MouseEventHandler<HTMLAnchorElement>
  children: ReactNode
}

/** ActionLink: a router link with the shared Button recipe. Use it when the action navigates rather than acts. */
export function ActionLink({ to, variant = 'primary', size = 'md', className, onClick, children }: ActionLinkProps) {
  return (
    <Link to={to} onClick={onClick} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  )
}
