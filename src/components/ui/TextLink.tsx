import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * TextLink / ExternalTextLink / TextButton — the one style for text links with
 * an icon, matching the home page: the words get the underline, the icon never
 * does (an underline running under an arrow or chevron looks broken).
 *
 * - `leadingIcon` describes the action (add, tune, photo_camera…) and stays put.
 * - `trailingIcon` points somewhere (arrow_forward by default for TextLink,
 *   north_east for ExternalTextLink) and nudges forward on hover.
 * - `underline`: 'hover' (default) shows it on hover/focus; 'always' keeps a
 *   soft underline that turns solid on hover.
 * Pass layout classes (margins, self-*) through `className`.
 */

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Tone = 'primary' | 'neutral'

interface TextLinkStyle {
  size?: Size
  tone?: Tone
  underline?: 'hover' | 'always'
  leadingIcon?: string
  /** `null` for no trailing icon. */
  trailingIcon?: string | null
  className?: string
  children: ReactNode
}

const SIZE: Record<Size, { text: string; icon: string; gap: string }> = {
  xs: { text: 'text-xs', icon: 'text-sm', gap: 'gap-1' },
  sm: { text: 'text-sm', icon: 'text-base', gap: 'gap-1.5' },
  md: { text: 'text-base', icon: 'text-lg', gap: 'gap-1.5' },
  lg: { text: 'text-lg', icon: 'text-xl', gap: 'gap-2' },
}

const TONE: Record<Tone, string> = {
  primary: 'text-primary hover:text-primary/85',
  neutral: 'text-ink hover:text-primary',
}

const UNDERLINE = {
  hover: 'underline-offset-4 decoration-2 decoration-current group-hover:underline group-focus-visible:underline',
  always: 'underline underline-offset-4 decoration-current/35 transition-[text-decoration-color] group-hover:decoration-current',
} as const

function linkClasses({ size = 'sm', tone = 'primary', className }: Pick<TextLinkStyle, 'size' | 'tone' | 'className'>) {
  return cn(
    'group inline-flex min-h-11 items-center rounded-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    SIZE[size].text,
    SIZE[size].gap,
    TONE[tone],
    className,
  )
}

function Content({ size = 'sm', underline = 'hover', leadingIcon, trailingIcon, children }: Omit<TextLinkStyle, 'className' | 'tone'>) {
  const icon = SIZE[size].icon
  return (
    <>
      {leadingIcon && <Icon name={leadingIcon} className={cn('shrink-0', icon)} />}
      <span className={UNDERLINE[underline]}>{children}</span>
      {trailingIcon && (
        <Icon
          name={trailingIcon}
          className={cn('shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5', icon)}
        />
      )}
    </>
  )
}

/** In-app link (router). Trailing arrow by default. */
export function TextLink({
  to,
  'aria-label': ariaLabel,
  trailingIcon = 'arrow_forward',
  ...style
}: TextLinkStyle & { to: string; 'aria-label'?: string }) {
  return (
    <Link to={to} aria-label={ariaLabel} className={linkClasses(style)}>
      <Content {...style} trailingIcon={trailingIcon} />
    </Link>
  )
}

/** Link to another site, in a new tab; says so to screen readers. */
export function ExternalTextLink({ href, trailingIcon = 'north_east', ...style }: TextLinkStyle & { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses(style)}>
      <Content {...style} trailingIcon={trailingIcon} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/** An action that looks like a text link (no navigation). No trailing icon by default. */
export function TextButton({
  trailingIcon = null,
  size,
  tone,
  underline,
  leadingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: TextLinkStyle & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>) {
  return (
    <button type={type} className={linkClasses({ size, tone, className })} {...rest}>
      <Content size={size} underline={underline} leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </button>
  )
}
