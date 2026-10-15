import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mockNavItems } from '@/api/mock/navigation'
import { mockDashboardData } from '@/api/mock/dashboard'
import type { NavItem } from '@/types'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { NavDropdown } from './NavDropdown'
import { Button } from '@/components/ui/Button'
import { FoxLogo, FoxLogoHandle } from './FoxLogo'
import { Icon } from '@/components/ui/Icon'
import { useUI, type BackgroundAnimation } from '@/context/UIContext'

const MOCK_STREAK    = mockDashboardData.stats.currentStreak
const MOCK_ACTIVITIES = mockDashboardData.streakCalendar.activities

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Intensity tier: 0=none 1=light 2=medium 3=strong 4=hard
function intensityTier(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes === 0)  return 0
  if (minutes <= 20)  return 1
  if (minutes <= 45)  return 2
  if (minutes <= 75)  return 3
  return 4
}

// `primary` is a CSS-var-backed token that dims correctly in dark mode — use it via
// opacity utilities instead of static rgba literals so the tiers stay theme-aware.
const TIER_BG: Record<number, string> = {
  1: 'bg-primary/15',
  2: 'bg-primary/35',
  3: 'bg-primary/65',
  4: 'bg-primary/100',
}
const TIER_FLAME_OPACITY = ['', 'opacity-40', 'opacity-60', 'opacity-85', 'opacity-100']
const TIER_NUM_COLOR     = ['text-on-surface-variant', 'text-primary', 'text-primary', 'text-white', 'text-white']
const TIER_LABEL         = ['', 'Light', 'Steady', 'Strong', 'Hard day!']

function StreakMonthPopup() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const year  = 2026
  const month = 3 // April (0-indexed)

  const actMap      = new Map(MOCK_ACTIVITIES.map(a => [a.date, a.minutes]))
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = 7

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const activeDaysThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => (actMap.get(dayKey(d)) ?? 0) > 0).length

  const hoveredMinutes = hoveredDay ? (actMap.get(dayKey(hoveredDay)) ?? 0) : 0
  const hoveredTier    = hoveredDay ? intensityTier(hoveredMinutes) : 0

  return (
    <div className="absolute top-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 w-72 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-elevation-2 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Caret */}
      <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-surface-container-lowest border-l border-t border-outline-variant/40 rounded-tl-sm" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-extrabold text-on-surface font-headline tracking-tight">
            {MONTH_NAMES[month]} {year}
          </p>
          <p className="text-2xs text-on-surface-variant font-body mt-0.5">
            {activeDaysThisMonth} day{activeDaysThisMonth !== 1 ? 's' : ''} studied this month
          </p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
          <Icon name="local_fire_department" className="text-sm text-primary animate-streak-flame" />
          <span className="text-xs font-bold text-primary font-label">{MOCK_STREAK}</span>
        </div>
      </div>

      {/* DOW labels */}
      <div className="grid grid-cols-7 mb-1.5 px-0.5">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
          <span key={i} className="text-center text-2xs font-bold text-on-surface-variant/60 font-label tracking-wide">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 px-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />

          const minutes = actMap.get(dayKey(day)) ?? 0
          const tier    = intensityTier(minutes)
          const isToday = day === today
          const isHovered = hoveredDay === day
          const isFuture  = day > today

          return (
            <div
              key={i}
              onMouseEnter={() => !isFuture && setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className="aspect-square"
            >
              <div
                className={[
                  'relative w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-150 cursor-default select-none',
                  tier > 0 && !isFuture
                    ? TIER_BG[tier]
                    : 'bg-surface-container-high',
                  isToday
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest'
                    : '',
                  isHovered && !isFuture
                    ? 'scale-110 shadow-md z-10'
                    : '',
                  isFuture ? 'opacity-30' : '',
                ].join(' ')}
              >
                {/* Flame — shown for active days */}
                {tier > 0 && !isFuture && (
                  <span className="leading-none" style={{ fontSize: tier === 4 ? 11 : 9 }}>
                    <Icon
                      name="local_fire_department"
                      className={`leading-none ${TIER_FLAME_OPACITY[tier]} ${tier >= 3 ? 'text-white' : 'text-primary'}`}
                    />
                  </span>
                )}
                {/* Day number */}
                <span
                  className={`font-bold font-label leading-none ${
                    isFuture ? 'text-on-surface-variant' : TIER_NUM_COLOR[tier]
                  }`}
                  style={{ fontSize: 10 }}
                >
                  {day}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hover info / legend */}
      <div className="mt-3 pt-2.5 border-t border-outline-variant/40 min-h-[28px] flex items-center justify-between gap-2">
        {hoveredDay && hoveredTier > 0 ? (
          <div className="flex items-center gap-1.5">
            <Icon name="local_fire_department" className="text-sm text-primary" />
            <span className="text-xs font-bold text-on-surface font-label">
              Apr {hoveredDay} —
            </span>
            <span className="text-xs text-on-surface-variant font-body">
              {hoveredMinutes} min · {TIER_LABEL[hoveredTier]}
            </span>
          </div>
        ) : hoveredDay ? (
          <div className="flex items-center gap-1.5">
            <Icon name="bedtime" className="text-sm text-on-surface-variant" />
            <span className="text-xs text-on-surface-variant font-body">Apr {hoveredDay} — Rest day</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {([1, 2, 3, 4] as const).map(t => (
              <div key={t} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${TIER_BG[t]}`} />
                <span className="text-2xs text-on-surface-variant font-label">{TIER_LABEL[t]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const navItems: NavItem[] = mockNavItems

export function Navbar() {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [streakOpen, setStreakOpen]         = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const { openModal } = useModal()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode, backgroundAnimation, setBackgroundAnimation } = useUI()

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
      setStreakOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, avatarMenuOpen, streakOpen])

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

  // Streak popup: close on outside click. Hover still opens it for mouse users (unchanged);
  // click/tap now also opens it so it's reachable on tablets and via keyboard (was hover-only).
  useEffect(() => {
    if (!streakOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (streakRef.current && !streakRef.current.contains(e.target as Node)) {
        setStreakOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [streakOpen])

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
      <nav className="fixed top-0 w-full z-50 h-nav bg-surface-container-lowest/80 backdrop-blur-xl shadow-elevation-1 border-b border-outline-variant/40">
        <div className="h-full flex justify-between items-center px-6 md:px-8 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-end gap-0 group"
            onClick={closeMobile}
            onMouseEnter={() => foxLogoRef.current?.play()}
            onMouseLeave={() => foxLogoRef.current?.reverse()}
          >
            <FoxLogo ref={foxLogoRef} size={50} />
            <span className="text-4xl font-bold tracking-tighter font-headline bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-orange-400 dark:via-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
              FoxSensei
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-10 tracking-wide text-sm font-semibold">
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
          </div>

          {/* Right side: dark mode + auth */}
          <div className="flex items-center gap-3">
            {/* Streak pill — shown when logged in */}
            {user && (
              <div ref={streakRef} className="relative hidden md:block">
                <Link
                  to="/dashboard"
                  onMouseEnter={() => setStreakOpen(true)}
                  onClick={(e) => {
                    // First activation (tap or keyboard Enter, with no preceding hover) reveals
                    // the calendar preview instead of navigating straight away — mirrors the
                    // hover-preview mouse users already get. Activating again (or a real mouse
                    // click, which already opened it via onMouseEnter) navigates through as normal.
                    if (!streakOpen) {
                      e.preventDefault()
                      setStreakOpen(true)
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Icon
                    name="local_fire_department"
                    className="text-base text-primary animate-streak-flame"
                  />
                  <span className="text-sm font-bold text-primary font-label leading-none">
                    {MOCK_STREAK}
                  </span>
                </Link>
                {streakOpen && <StreakMonthPopup />}
              </div>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200 active:scale-90 overflow-hidden group/toggle"
            >
              <div
                className="transition-transform duration-500 ease-out"
                style={{
                  transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <Icon name={darkMode ? 'light_mode' : 'dark_mode'} className="text-xl group-hover/toggle:text-primary transition-colors" />
              </div>
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
                      src={
                        user.profileImage ||
                        (user.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png')
                      }
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

                  {/* Background animation picker */}
                  <div className="px-4 py-2.5 border-t border-b border-outline-variant/30 my-1">
                    <p className="text-2xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-label">Background</p>
                    <div className="flex gap-1.5">
                      {([ ['petals', 'local_florist', 'Petals'], ['fish', 'set_meal', 'Fish'], ['none', 'close', 'None'] ] as [BackgroundAnimation, string, string][]).map(([val, iconName, label]) => (
                        <button
                          key={val}
                          onClick={() => setBackgroundAnimation(val)}
                          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-2xs font-bold font-label transition-all"
                          style={backgroundAnimation === val
                            ? { background: 'rgb(var(--surface-container-high))', color: 'rgb(var(--on-surface))' }
                            : { color: 'rgb(var(--on-surface-variant))' }
                          }
                        >
                          <Icon name={iconName} className="text-sm" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

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
              <div className="hidden md:flex items-center gap-6">
                <Button
                  variant="ghost"
                  className="text-sm px-0 py-0 rounded-none shadow-none"
                  onClick={() => openModal('login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="px-6 py-2.5 text-sm"
                  onClick={() => openModal('signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => setMobileOpen(v => !v)}
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
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label}>
                    <p className="text-2xs uppercase tracking-widest font-bold text-on-surface-variant px-3 py-2">
                      {item.label}
                    </p>
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        onClick={closeMobile}
                        className="block px-3 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm font-medium transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href ?? '/'}
                    onClick={closeMobile}
                    className="block px-3 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm font-semibold transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}

              <div className="border-t border-outline-variant/30 pt-4 mt-4">
                {user ? (
                  <div className="space-y-1">
                    {/* Mobile streak badge */}
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                      <Icon name="local_fire_department" className="text-base text-primary animate-streak-flame" />
                      <span className="text-sm font-bold text-primary font-label">
                        {MOCK_STREAK}-day streak
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex-shrink-0">
                        <img
                          src={
                            user.profileImage ||
                            (user.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png')
                          }
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
                    <button
                      onClick={() => { logout(); closeMobile() }}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-error hover:bg-error/5 text-sm text-left transition-colors"
                    >
                      <Icon name="logout" className="text-base" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => { openModal('login'); closeMobile() }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full text-sm py-3"
                      onClick={() => { openModal('signup'); closeMobile() }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
