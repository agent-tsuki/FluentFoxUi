import { lazy, Suspense, useState, useRef, useEffect } from 'react'
import { useReviewGate } from '@/hooks/useReviewGate'
import { Link } from 'react-router-dom'
import { mockNavItems } from '@/api/mock/navigation'
import type { NavItem } from '@/types'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { NavDropdown } from './NavDropdown'
import { MobileNavSections } from './MobileNavSections'
import { Button } from '@/components/ui/Button'
import { FoxLogo, FoxLogoHandle } from './FoxLogo'
import { Icon } from '@/components/ui/Icon'
import { StreakFire } from '@/components/ui/StreakFire'
import { useUI } from '@/context/UIContext'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { useProgressOverview } from '@/hooks/useProgress'
import { useLingeringPopover } from '@/hooks/useLingeringPopover'
import { DueBadge } from '@/components/learnSession/DueBadge'
import { reviewPath } from '@/lib/learn/paths'
import { asset } from '@/lib/assets'
import { AdminMenuLink } from '@/components/admin/AdminMenuLink'
import { THEME_BUTTON_INTENT, ThemeToggleIcon } from './ThemeToggleIcon'

// Loaded on first open: the month view and its calendar request stay out of the first paint.
const StreakMonthPopup = lazy(() => import('./StreakMonthPopup').then((m) => ({ default: m.StreakMonthPopup })))

const navItems: NavItem[] = mockNavItems
/** How long the streak calendar stays after the pointer leaves the flame or the calendar. */
const STREAK_PREVIEW_LINGER_MS = 2000

export function Navbar() {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const { openModal } = useModal()
  const { user, logout } = useAuth()
  const dueNow = useLearnSummary().summary?.due_now ?? 0
  const streak = useProgressOverview().data?.streak.current ?? 0
  const { darkMode, toggleDarkMode } = useUI()
  const streakPopover = useLingeringPopover(STREAK_PREVIEW_LINGER_MS)
  const gateReview = useReviewGate()
  const streakOpen = streakPopover.open
  const closeStreak = streakPopover.close

  const isDesktop       = useMediaQuery('(min-width: 768px)')
  const foxLogoRef      = useRef<FoxLogoHandle>(null)
  const avatarMenuRef   = useRef<HTMLDivElement>(null)
  const streakRef       = useRef<HTMLDivElement>(null)
  const mobileDrawerRef = useRef<HTMLDivElement>(null)
  const closeMobile   = () => setMobileOpen(false)

  // Mobile drawer: lock body scroll while open (mirrors AuthModal's pattern).
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Mobile drawer + avatar menu + streak popup: close on Escape.
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

  // Avatar menu: close on outside click (click/tap is the primary toggle now, not hover).
  useEffect(() => {
    if (!avatarMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [avatarMenuOpen])

  // Streak popup: close at once on an outside click. Hover, tap and keyboard open it, and it
  // lingers 2 s after the pointer leaves (useLingeringPopover).
  useEffect(() => {
    if (!streakOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (streakRef.current && !streakRef.current.contains(e.target as Node)) {
        closeStreak()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [streakOpen, closeStreak])

  // Mobile drawer: focus trap. On open, focus the first focusable item; while open,
  // Tab/Shift+Tab wraps around at the drawer's boundary instead of escaping into the page behind it.
  useEffect(() => {
    if (!mobileOpen) return
    const drawer = mobileDrawerRef.current
    if (!drawer) return

    const getFocusable = () =>
      Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))

    getFocusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    drawer.addEventListener('keydown', onKeyDown)
    return () => drawer.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 h-nav px-3 py-2 md:px-6 md:py-3">
        {/* Floating glass bar — lets the page (e.g. the home hero) show through softly. */}
        <div className="h-full flex justify-between items-center gap-4 px-4 md:px-6 max-w-7xl mx-auto rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/70 backdrop-blur-xl shadow-elevation-1">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-end gap-0 group"
            onClick={closeMobile}
            onMouseEnter={() => foxLogoRef.current?.play()}
            onMouseLeave={() => foxLogoRef.current?.reverse()}
          >
            <FoxLogo ref={foxLogoRef} size={isDesktop ? 42 : 32} />
            <span className="text-2xl md:text-3xl font-bold tracking-tighter font-headline bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-primary dark:via-orange-300 dark:to-orange-200 bg-clip-text text-transparent">
              FoxSensei
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 tracking-wide text-sm font-semibold">
            {navItems.map((item) =>
              item.dropdown ? (
                <NavDropdown key={item.label} label={item.label} items={item.dropdown} />
              ) : (
                <Link
                  key={item.label}
                  to={item.href ?? '/'}
                  className="text-on-surface-variant hover:text-on-surface hover:scale-105 transition-all duration-200"
                >
                  {item.label}
                </Link>
              )
            )}
            {/* Review (signed in), next to Classes, with the due count */}
            {user && (
              <Link
                to={reviewPath()}
                onClick={gateReview()}
                className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface hover:scale-105 transition-all duration-200"
              >
                Review
                <DueBadge count={dueNow} />
              </Link>
            )}
          </div>

          {/* Right side: dark mode + auth */}
          <div className="flex items-center gap-3">
            {/* Streak — the animated fire and the day count, shown when logged in */}
            {user && (
              <div ref={streakRef} className="relative hidden md:block" {...streakPopover.wrapperProps}>
                <Link
                  to="/dashboard"
                  // A first tap or Enter shows the calendar preview; the next one opens the dashboard.
                  onClick={streakPopover.onTriggerClick}
                  aria-label={`${streak}-day streak. Show streak calendar`}
                  className="group/streak flex items-center gap-2 min-h-11 px-2 rounded-full transition-colors hover:bg-surface-container"
                >
                  <StreakFire lit={streak > 0} className="text-[1.375rem] transition-transform duration-200 group-hover/streak:scale-110" />
                  <span className="text-sm font-bold text-on-surface font-label leading-none tabular-nums">
                    {streak}
                    <span className="hidden lg:inline font-semibold text-on-surface-variant"> day streak</span>
                  </span>
                </Link>
                {streakOpen && (
                  <Suspense fallback={null}>
                    <StreakMonthPopup streak={streak} />
                  </Suspense>
                )}
              </div>
            )}

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              {...THEME_BUTTON_INTENT}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors duration-200 active:scale-90 group/toggle"
            >
              <ThemeToggleIcon dark={darkMode} className="text-xl transition-colors group-hover/toggle:text-primary" />
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div ref={avatarMenuRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={avatarMenuOpen}
                  className="flex items-center gap-2 cursor-pointer group/avatar"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20 group-hover/avatar:border-primary transition-colors shadow-md overflow-hidden bg-surface-container">
                    <img
                      src={asset(
                        user.profileImage ||
                        (user.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png')
                      )}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Icon name="keyboard_arrow_down" className="text-on-surface-variant text-sm group-hover/avatar:text-primary" />
                </button>

                {/* Dropdown */}
                <div
                  className={`transition-all duration-150 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 min-w-[13rem] bg-surface-container-lowest shadow-elevation-2 rounded-xl p-2 border border-outline-variant/30 ${
                    avatarMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                  }`}
                >
                  <div className="px-4 py-2 border-b border-outline-variant/30 mb-1">
                    <p className="text-sm font-semibold text-on-surface">{user.firstName ?? user.username}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant text-sm transition-colors"
                  >
                    <Icon name="person" className="text-base" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant text-sm transition-colors"
                  >
                    <Icon name="dashboard" className="text-base" />
                    Dashboard
                  </Link>
                  <AdminMenuLink
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    {...THEME_BUTTON_INTENT}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                  >
                    <ThemeToggleIcon dark={darkMode} className="text-base" />
                    {darkMode ? 'Light theme' : 'Dark theme'}
                  </button>

                  <button
                    onClick={() => { logout(); setAvatarMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-error/5 rounded-lg text-error text-sm text-left transition-colors"
                  >
                    <Icon name="logout" className="text-base" />
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Divider between the theme toggle and the sign-in button. */}
                <span aria-hidden="true" className="hidden md:block h-6 w-px bg-outline-variant/60" />
                <Button
                  variant="inverse"
                  className="hidden md:inline-flex items-center min-h-10 !rounded-full !px-5 !py-1.5 text-sm"
                  onClick={() => openModal('login')}
                  {...authModalPrefetchHandlers}
                >
                  Sign in / up
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              // Logged out, the drawer holds Login / Sign Up: fetch the modal early.
              {...(user ? {} : authModalPrefetchHandlers)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} className="text-2xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col md:hidden">
          {/* Backdrop — bg-black/60 (not `on-surface`, which flips per theme) so it always darkens. */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="relative mt-nav bg-surface-container-lowest border-b border-outline-variant/40 shadow-elevation-2 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="px-6 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
              <MobileNavSections items={navItems} onNavigate={closeMobile} />

              <div className="border-t border-outline-variant/30 pt-4 mt-4">
                {user ? (
                  <div className="space-y-1">
                    {/* Mobile streak badge */}
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                      <StreakFire lit={streak > 0} className="text-xl" />
                      <span className="text-sm font-bold text-primary font-label">
                        {streak}-day streak
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex-shrink-0">
                        <img
                          src={asset(
                            user.profileImage ||
                            (user.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png')
                          )}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{user.firstName ?? user.username}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container text-sm transition-colors"
                    >
                      <Icon name="person" className="text-base" /> Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container text-sm transition-colors"
                    >
                      <Icon name="dashboard" className="text-base" /> Dashboard
                    </Link>
                    <AdminMenuLink
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      {...THEME_BUTTON_INTENT}
                      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                    >
                      <ThemeToggleIcon dark={darkMode} className="text-base" />
                      {darkMode ? 'Light theme' : 'Dark theme'}
                    </button>
                    <Link
                      to={reviewPath()}
                      onClick={(e) => {
                        closeMobile()
                        gateReview()(e)
                      }}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container text-sm transition-colors"
                    >
                      Review all
                      <DueBadge count={dueNow} />
                    </Link>
                    <button
                      onClick={() => { logout(); closeMobile() }}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-error hover:bg-error/5 text-sm text-left transition-colors"
                    >
                      <Icon name="logout" className="text-base" /> Log out
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="inverse"
                    className="w-full min-h-11 !rounded-full text-sm"
                    onClick={() => { openModal('login'); closeMobile() }}
                    {...authModalPrefetchHandlers}
                  >
                    Sign in / up
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
