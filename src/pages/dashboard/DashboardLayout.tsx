import { Suspense, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FIXED_SIDEBAR_OFFSET } from '@/components/layout/FixedSidebar'
import { DashboardSidebar, DashboardTabs } from '@/components/dashboard/DashboardSidebar'
import { LoadingState } from '@/components/ui/LoadingState'
import { useProgressOverview } from '@/hooks/useProgress'
import { DASHBOARD_PATH, LEGACY_HASH_SECTION } from '@/lib/dashboard/sections'

/**
 * /dashboard shell: the dashboard's own fixed left sidebar (tabs on phones) and the
 * current section. Each section loads its own data with its own loading,
 * error and empty states, so one slow endpoint never blanks the page.
 */
export function DashboardLayout() {
  const { pathname, hash, search } = useLocation()
  const overview = useProgressOverview()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Old single-page links (/dashboard#forecast) open the section that holds that block now.
  const legacy = pathname === DASHBOARD_PATH ? LEGACY_HASH_SECTION[hash] : undefined
  if (legacy) return <Navigate to={{ pathname: `${DASHBOARD_PATH}/${legacy}`, search }} replace />

  return (
    <>
      <DashboardSidebar dueNow={overview.data?.today.due_now ?? null} streak={overview.data?.streak.current ?? null} />
      <main className={`pt-nav ${FIXED_SIDEBAR_OFFSET}`}>
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10 lg:pt-8">
          <DashboardTabs />
          <div className="pt-6 lg:pt-0">
            <Suspense fallback={<LoadingState label="Loading section…" className="py-24" />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
