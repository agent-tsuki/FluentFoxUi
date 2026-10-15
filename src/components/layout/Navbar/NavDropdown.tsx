import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DropdownItem } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface NavDropdownProps {
  label: string
  items: DropdownItem[]
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape (click/tap is the primary toggle — see CLAUDE.md
  // "never gate a required interaction behind hover alone").
  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative group">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 cursor-pointer text-on-surface-variant group-hover:text-on-surface group-hover:scale-105 transition-all duration-200"
      >
        {label}
        <Icon name="keyboard_arrow_down" className="text-xs" />
      </button>
      <div
        className={`transition-all duration-150 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 min-w-[10rem] bg-surface-container-lowest shadow-elevation-2 rounded-xl p-2 border border-outline-variant/30 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface text-sm whitespace-nowrap transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
