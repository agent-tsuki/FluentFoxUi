import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { NavDropdown } from './NavDropdown'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StreakFire } from '@/components/ui/StreakFire'
import { useUI } from '@/context/UIContext'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { useProgressOverview } from '@/hooks/useProgress'
import { useLingeringPopover } from '@/hooks/useLingeringPopover'
import { DueBadge } from '@/components/learnSession/DueBadge'
import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { isLessonPath, isNavItemActive, TOP_NAV, type TopNavItem } from '@/lib/content/nav'
import { useLessonStore } from '@/store/lessonStore'
import { AdminMenuLink } from '@/components/admin/AdminMenuLink'
import { THEME_BUTTON_INTENT, ThemeToggleIcon } from './ThemeToggleIcon'

// Loaded on first open: the month view and its calendar request stay out of the first paint.
const StreakMonthPopup = lazy(() => import('./StreakMonthPopup').then((m) => ({ default: m.StreakMonthPopup })))

/** The streak calendar opens on click and closes this long after the pointer leaves it (or after a tap). */
const STREAK_PREVIEW_LINGER_MS = 1000

const LINK_CLASS =
  'inline-flex min-h-touch-target items-center rounded-md px-3 text-label text-ink-muted transition-colors duration-fast hover:bg-surface-hover hover:text-ink aria-[current=page]:bg-surface-sunken aria-[current=page]:text-ink'
const MENU_ROW = 'flex min-h-touch-target w-full items-center gap-2 rounded-md px-3 text-left text-label text-ink-muted transition-colors duration-fast hover:bg-surface-hover hover:text-ink'

/** A course's link, resuming where the learner left off when that's known. */
function useNavHref() {
  const byCourse = useLessonStore((s) => s.byCourse)
  return (item: TopNavItem) => (item.label === 'Grammar' ? byCourse.grammar : item.label === 'Kanji' ? byCourse.kanji : undefined) ?? item.href
}

function avatarSrc(user: { profileImage?: string | null; gender?: string | null }) {
  return asset(user.profileImage || (user.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png'))
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { openModal } = useModal()
  const { user, logout } = useAuth()
  const dueNow = useLearnSummary().summary?.due_now ?? 0
  const streak = useProgressOverview().data?.streak.current ?? 0
  const { darkMode, toggleDarkMode } = useUI()
  const streakPopover = useLingeringPopover(STREAK_PREVIEW_LINGER_MS)
  const streakOpen = streakPopover.open
  const closeStreak = streakPopover.close
  const navHref = useNavHref()
  const inLesson = isLessonPath(pathname)

  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)
  const mobileDrawerRef = useRef<HTMLDivElement>(null)
  const closeMobile = () => setMobileOpen(false)

  // Mobile sheet: lock body scroll while open (mirrors AuthModal's pattern).
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Mobile sheet + avatar menu + streak popup: close on Escape.
  useEffect(() => {
    if (!mobileOpen && !avatarMenuOpen && !streakOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMobileOpen(false)
      setAvatarMenuOpen(false)
      closeStreak()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, avatarMenuOpen, streakOpen, closeStreak])

  // Avatar menu: close on outside click.
  useEffect(() => {
    if (!avatarMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setAvatarMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [avatarMenuOpen])

  // Streak popup: close at once on an outside click.
  useEffect(() => {
    if (!streakOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (streakRef.current && !streakRef.current.contains(e.target as Node)) closeStreak()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [streakOpen, closeStreak])

  // Mobile sheet: focus trap.
  useEffect(() => {
    if (!mobileOpen) return
    const drawer = mobileDrawerRef.current
    if (!drawer) return
    const getFocusable = () => Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    getFocusable()[0]?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const end = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        end.focus()
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault()
        first.focus()
      }
    }
    drawer.addEventListener('keydown', onKeyDown)
    return () => drawer.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const signIn = () => openModal('login')

  return (
    <>
      {inLesson && (
        <a
          href="#lesson"
          className="fixed left-4 top-[-3.75rem] z-[70] rounded-md bg-surface-inverse px-4 py-2.5 text-label text-on-surface-inverse focus:top-2"
        >
          Skip to lesson
        </a>
      )}

      <nav aria-label="Main" className="fixed inset-x-0 top-0 z-50 h-nav border-b border-line bg-surface-raised">
        <div className="flex h-full items-center gap-2 px-3 lg:gap-6 lg:px-6">
          <Link
            to="/"
            className="group flex min-h-touch-target items-center font-display text-xl font-extrabold tracking-[-0.03em]"
            onClick={closeMobile}
          >
            {/* The wordmark is the logo. leading-none centres the line box, not the
                letters: the lift puts its baseline on the menu links' baseline. */}
            <span className="brand-wordmark -translate-y-[0.175em] leading-none">FoxSensei</span>
          </Link>

          <ul data-tour="nav" className="hidden items-center gap-1 lg:flex">
            {TOP_NAV.map((item) => {
              const active = isNavItemActive(item, pathname)
              return (
                <li key={item.label}>
                  {item.children ? (
                    <NavDropdown label={item.label} items={item.children} active={active} className={LINK_CLASS} />
                  ) : (
                    <Link to={navHref(item)} aria-current={active ? 'page' : undefined} className={cn(LINK_CLASS, 'gap-1.5')}>
                      {item.label}
                      {user && item.href === '/quiz' && <DueBadge count={dueNow} />}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            {user && (
              <div ref={streakRef} data-tour="streak" className="relative hidden lg:block" {...streakPopover.wrapperProps}>
                <Link
                  to="/dashboard"
                  onClick={streakPopover.onTriggerClick}
                  aria-label={`${streak}-day streak. Show streak calendar`}
                  className="flex min-h-touch-target items-center gap-1.5 rounded-md px-2 transition-colors duration-fast hover:bg-surface-hover"
                >
                  <StreakFire lit={streak > 0} className="text-[1.375rem]" />
                  <span className="text-label tabular-nums text-ink">{streak}</span>
                </Link>
                {streakOpen && (
                  <Suspense fallback={null}>
                    <StreakMonthPopup streak={streak} />
                  </Suspense>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={toggleDarkMode}
              {...THEME_BUTTON_INTENT}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden size-touch-target items-center justify-center rounded-md text-ink-muted transition-colors duration-fast hover:bg-surface-hover hover:text-ink lg:flex"
            >
              <ThemeToggleIcon dark={darkMode} className="text-xl" />
            </button>

            {user ? (
              <div ref={avatarMenuRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  aria-label="Your profile"
                  aria-haspopup="true"
                  aria-expanded={avatarMenuOpen}
                  className="grid size-touch-target place-items-center rounded-full"
                >
                  <span className="block size-9 overflow-hidden rounded-full bg-surface-sunken">
                    <img src={avatarSrc(user)} alt="" width={36} height={36} className="size-full object-cover" />
                  </span>
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[13rem] rounded-lg bg-surface-raised p-2 shadow-elevation-2">
                    <div className="mb-1 border-b border-line px-3 py-2">
                      <p className="text-label text-ink">{user.firstName ?? user.username}</p>
                      <p className="truncate text-caption text-ink-muted">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setAvatarMenuOpen(false)} className={MENU_ROW}>
                      <Icon name="person" className="text-base" /> Profile
                    </Link>
                    <Link to="/dashboard" onClick={() => setAvatarMenuOpen(false)} className={MENU_ROW}>
                      <Icon name="dashboard" className="text-base" /> Dashboard
                    </Link>
                    <AdminMenuLink onClick={() => setAvatarMenuOpen(false)} className={MENU_ROW} />
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setAvatarMenuOpen(false)
                      }}
                      className="flex min-h-touch-target w-full items-center gap-2 rounded-md px-3 text-left text-label text-danger-ink transition-colors duration-fast hover:bg-danger-soft"
                    >
                      <Icon name="logout" className="text-base" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="ghost" className="hidden lg:inline-flex" onClick={signIn} {...authModalPrefetchHandlers}>
                Sign in
              </Button>
            )}

            <button
              type="button"
              className="flex size-touch-target items-center justify-center rounded-md text-ink-muted transition-colors duration-fast hover:bg-surface-hover lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              {...(user ? {} : authModalPrefetchHandlers)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} className="text-2xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Phone and tablet menu: one flat level with the same items. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile} />
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="relative mt-nav max-h-[calc(100dvh-theme(spacing.nav))] overflow-y-auto rounded-b-xl bg-surface-raised p-4 shadow-elevation-3"
          >
            <ul className="grid gap-1">
              {TOP_NAV.flatMap((item) =>
                item.children
                  ? item.children.map((child) => ({ label: child.label, to: child.href, active: pathname.startsWith(child.href), isPractice: false }))
                  : [{ label: item.label, to: navHref(item), active: isNavItemActive(item, pathname), isPractice: item.href === '/quiz' }],
              ).map((row) => (
                <li key={row.label}>
                  <Link to={row.to} onClick={closeMobile} aria-current={row.active ? 'page' : undefined} className={cn(LINK_CLASS, 'flex justify-between')}>
                    {row.label}
                    {user && row.isPractice && <DueBadge count={dueNow} />}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 grid gap-1 border-t border-line pt-3">
              <button type="button" onClick={toggleDarkMode} {...THEME_BUTTON_INTENT} className={MENU_ROW}>
                <ThemeToggleIcon dark={darkMode} className="text-base" />
                {darkMode ? 'Light theme' : 'Dark theme'}
              </button>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="block size-10 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
                      <img src={avatarSrc(user)} alt="" width={40} height={40} className="size-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-label text-ink">{user.firstName ?? user.username}</span>
                      <span className="block truncate text-caption text-ink-muted">{user.email}</span>
                    </span>
                  </div>
                  <p className="flex items-center gap-2 px-3 py-2 text-label text-ink">
                    <StreakFire lit={streak > 0} className="text-xl" />
                    {streak}-day streak
                  </p>
                  <Link to="/profile" onClick={closeMobile} className={MENU_ROW}>
                    <Icon name="person" className="text-base" /> Profile
                  </Link>
                  <Link to="/dashboard" onClick={closeMobile} className={MENU_ROW}>
                    <Icon name="dashboard" className="text-base" /> Dashboard
                  </Link>
                  <AdminMenuLink onClick={closeMobile} className={MENU_ROW} />
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      closeMobile()
                    }}
                    className="flex min-h-touch-target w-full items-center gap-2 rounded-md px-3 text-left text-label text-danger-ink hover:bg-danger-soft"
                  >
                    <Icon name="logout" className="text-base" /> Log out
                  </button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    signIn()
                    closeMobile()
                  }}
                  {...authModalPrefetchHandlers}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
