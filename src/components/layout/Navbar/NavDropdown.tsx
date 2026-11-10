import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TopNavChild } from '@/lib/content/nav'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface NavDropdownProps {
  label: string
  items: readonly TopNavChild[]
  active: boolean
  className: string
}

/** A course's small menu in the top nav. Click or tap toggles it; outside click and Escape close it. */
export function NavDropdown({ label, items, active, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
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
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open} aria-current={active ? 'page' : undefined} className={cn(className, 'gap-1')}>
        {label}
        <Icon name="expand_more" className={cn('text-lg transition-transform duration-base', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] w-80 rounded-lg bg-surface-raised p-2 shadow-elevation-2">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="grid min-h-touch-target grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-2.5 text-ink hover:bg-surface-hover"
            >
              <span aria-hidden lang="ja" className="grid size-10 place-items-center rounded-md bg-surface-sunken font-ja-display text-xl font-bold">
                {item.glyph}
              </span>
              <span>
                <span className="block text-label">{item.label}</span>
                <span className="block text-caption text-ink-muted">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
