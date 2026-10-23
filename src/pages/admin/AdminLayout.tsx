import { Suspense } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { usePermissions, type PermissionsState } from '@/hooks/admin/usePermissions'
import { resolveErrorMessage } from '@/api/errors'

interface AdminNavItem {
  to: string
  label: string
  icon: string
  visible: (p: PermissionsState) => boolean
}

const NAV: AdminNavItem[] = [
  {
    to: '/admin/my-channels',
    label: 'YouTube Channels',
    icon: 'smart_display',
    visible: p => p.canAny('classes.channel.edit') || p.canAny('classes.channel.media') || p.canAny('classes.publish') || p.canAny('classes.sync'),
  },
  { to: '/admin/classes/courses', label: 'Courses', icon: 'school', visible: p => p.canAny('classes.course.edit') },
  { to: '/admin/teachers', label: 'Teachers', icon: 'mail', visible: p => p.canAny('permissions.manage') },
  { to: '/admin/permissions', label: 'Permissions', icon: 'verified', visible: p => p.canAny('permissions.manage') },
]

/**
 * /admin shell: needs a signed-in user (RequireAuth wraps it in the router)
 * with at least one admin permission; everyone else gets the 403 screen.
 * The sub-nav only lists sections the user can use.
 */
export function AdminLayout() {
  const permissions = usePermissions()
  const { isLoading, error, refetch, hasAny } = permissions

  if (isLoading) return <LoadingState label="Checking your access…" className="mx-auto max-w-5xl px-6 pb-24 pt-nav" />
  if (error) {
    return (
      <main className="pt-nav">
        <ErrorState title="We couldn't check your access" message={resolveErrorMessage(error)} onRetry={refetch} />
      </main>
    )
  }
  if (!hasAny) return <main className="pt-nav"><AdminForbidden /></main>

  const items = NAV.filter(item => item.visible(permissions))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-nav sm:px-6 md:px-10">
      <nav aria-label="Admin" className="-mx-4 mb-8 mt-6 overflow-x-auto border-b border-outline-variant/60 px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1">
          {items.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    '-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface',
                  )
                }
              >
                <Icon name={item.icon} className="text-lg" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Suspense fallback={<LoadingState label="Loading page…" />}>
        <Outlet />
      </Suspense>
    </main>
  )
}

/** /admin → the first section the user can open. */
export function AdminIndexRedirect() {
  const permissions = usePermissions()
  const first = NAV.find(item => item.visible(permissions))
  return <Navigate to={first?.to ?? '/admin/my-channels'} replace />
}
