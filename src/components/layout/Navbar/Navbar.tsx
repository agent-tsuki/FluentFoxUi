import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockNavItems } from '@/api/mock/navigation'
import type { NavItem } from '@/types'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { NavDropdown } from './NavDropdown'
import { Button } from '@/components/ui/Button'
import { FoxLogo } from './FoxLogo'
import { Icon } from '@/components/ui/Icon'
import { useUI } from '@/context/UIContext'

const navItems: NavItem[] = mockNavItems

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openModal } = useModal()
  const { user, logout } = useAuth()
  const { setIsProfileOverlayOpen, setOverlayProfile, setTriggerRect, darkMode, toggleDarkMode } = useUI()

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(25,28,29,0.04)] border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-end gap-0 group" onClick={closeMobile}>
            <FoxLogo size={50} />
            <span className="text-4xl font-bold tracking-tighter font-headline bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-orange-400 dark:via-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
              FluentFox
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
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Icon name={darkMode ? 'light_mode' : 'dark_mode'} className="text-xl" />
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="relative group hidden md:block">
                <button
                  onClick={(e) => {
                    setOverlayProfile(user)
                    setTriggerRect(e.currentTarget.getBoundingClientRect())
                    setIsProfileOverlayOpen(true)
                  }}
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

                {/* Invisible hover bridge */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[11rem] h-2" />

                {/* Dropdown */}
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 min-w-[11rem] bg-surface-container-lowest shadow-xl rounded-xl p-2 border border-outline-variant/30">
                  <div className="px-4 py-2 border-b border-outline-variant/30 mb-1">
                    <p className="text-sm font-semibold text-on-surface">{user.firstName}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant text-sm transition-colors"
                  >
                    <Icon name="person" className="text-base" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant text-sm transition-colors"
                  >
                    <Icon name="dashboard" className="text-base" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
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
                  className="px-6 py-2.5 text-sm rounded-lg"
                  onClick={() => openModal('signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <div className="relative mt-[73px] bg-surface-container-lowest border-b border-outline-variant/20 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-6 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-3 py-2">
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
                        <p className="text-sm font-semibold text-on-surface">{user.firstName}</p>
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
                      className="w-full text-sm rounded-lg py-3"
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
