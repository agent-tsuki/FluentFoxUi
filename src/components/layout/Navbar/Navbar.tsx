import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { NavItem } from '@/types'
import { navigationService } from '@/api/services/navigationService'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { useUI } from '@/context/UIContext'
import { NavDropdown } from './NavDropdown'
import { Button } from '@/components/ui/Button'
import { FoxLogo } from './FoxLogo'
import { Icon } from '@/components/ui/Icon'

export function Navbar() {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const { openModal } = useModal()
  const { user, logout } = useAuth()
  const { mouseFollowerEnabled, toggleMouseFollower } = useUI()

  useEffect(() => {
    navigationService.getNavItems().then(setNavItems)
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(25,28,29,0.04)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-end gap-0 group"
        >
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
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:scale-105 transition-transform duration-200"
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Auth / Profile */}
        {user ? (
          <div className="relative group">
            {/* Avatar button */}
            <button className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md select-none">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <Icon name="keyboard_arrow_down" className="text-slate-500 dark:text-slate-400 text-sm" />
            </button>

            {/* Invisible bridge */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[11rem] h-2" />

            {/* Dropdown */}
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 min-w-[11rem] bg-white dark:bg-slate-800 shadow-xl rounded-xl p-2 border border-slate-100 dark:border-slate-700">
              {/* User info header */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.firstName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm"
              >
                <Icon name="person" className="text-base" />
                Profile
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm"
              >
                <Icon name="dashboard" className="text-base" />
                Dashboard
              </Link>

              <button
                onClick={toggleMouseFollower}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon name="mouse" className="text-base" />
                  Cursor Effect
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors duration-300 relative ${mouseFollowerEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-300 ${mouseFollowerEnabled ? 'left-5' : 'left-1'}`} />
                </div>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 text-sm text-left"
              >
                <Icon name="logout" className="text-base" />
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
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
      </div>
    </nav>
  )
}
