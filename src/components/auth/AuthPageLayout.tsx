/**
 * Layout + building blocks for standalone auth pages that users reach from
 * an email link or a "new link" button: /verify, /forgot-password,
 * /reset-password. Minimal chrome, no navbar, no third-party scripts.
 */

import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { FoxLogo } from '@/components/layout/Navbar/FoxLogo'

export const primaryLinkClass =
  'inline-flex w-full items-center justify-center bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 dark:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
export const secondaryLinkClass =
  'text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2'

interface AuthPageLayoutProps {
  children: ReactNode
  /**
   * Adds `<meta name="referrer" content="no-referrer">` while mounted, for
   * pages whose URL carried a token. Defence in depth: the token is also
   * stripped from the URL and the host sends Referrer-Policy on these routes.
   */
  noReferrer?: boolean
}

export function AuthPageLayout({ children, noReferrer = false }: AuthPageLayoutProps) {
  useEffect(() => {
    if (!noReferrer) return
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => { meta.remove() }
  }, [noReferrer])

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-end gap-0 mb-12">
        <FoxLogo size={44} />
        <span className="text-3xl font-bold tracking-tighter font-headline bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
          FoxSensei
        </span>
      </Link>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant/40 p-8 md:p-10">
        {children}
      </div>

      <p className="mt-8 text-xs text-on-surface-variant/60">FoxSensei · Japanese Learning Platform</p>
    </div>
  )
}

// ── Status card ───────────────────────────────────────────────────────────────

const toneClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error:   'bg-error/10 text-error',
} as const

interface StatusCardProps {
  icon:      string
  tone:      keyof typeof toneClasses
  title:     string
  body:      ReactNode
  pulse?:    boolean
  children?: ReactNode
}

/** Icon + title + body + actions. Announced to screen readers when it appears. */
export function StatusCard({ icon, tone, title, body, pulse, children }: StatusCardProps) {
  return (
    <div role="status" aria-live="polite" className="py-2 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${toneClasses[tone]} ${pulse ? 'animate-pulse' : ''}`}>
        <Icon name={icon} className="text-3xl" filled={!pulse} />
      </div>
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">{title}</h1>
      <div className="text-sm text-on-surface-variant leading-relaxed mb-8">{body}</div>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  )
}

/** Mail link to support, for suspended / deleted accounts. */
export function SupportLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="font-bold text-primary hover:underline whitespace-nowrap">
      {email}
    </a>
  )
}
