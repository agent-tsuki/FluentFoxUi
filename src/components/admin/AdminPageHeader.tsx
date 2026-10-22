import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

/** Title row for an admin screen: optional back link, h1, description and actions. */
interface AdminPageHeaderProps {
  title: string
  description?: string
  back?: { to: string; label: string }
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, back, actions }: AdminPageHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      {back && (
        <Link
          to={back.to}
          className="-my-2 inline-flex min-h-11 items-center gap-1 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <Icon name="arrow_back" className="text-base" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-on-surface-variant">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
