import { useEffect, useRef, useState } from 'react'
import type { JlptLevel } from '@/types'
import { Icon } from '@/components/ui/Icon'

type FilterValue = JlptLevel | 'all'

interface KanjiFilterBarProps {
  active: FilterValue
  available: JlptLevel[]
  onChange: (value: FilterValue) => void
}

const LEVEL_META: Record<JlptLevel, { label: string }> = {
  N5: { label: 'N5 Beginner' },
  N4: { label: 'N4 Elementary' },
  N3: { label: 'N3 Intermediate' },
  N2: { label: 'N2 Advanced' },
  N1: { label: 'N1 Mastery' },
}

export function KanjiFilterBar({ active, available, onChange }: KanjiFilterBarProps) {
  const currentLabel = active === 'all' ? 'All JLPT Levels' : LEVEL_META[active].label
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click / tap
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape and return focus to the trigger
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleSelect = (value: FilterValue) => {
    onChange(value)
    setOpen(false)
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20 px-4 md:px-0">
      {/* Level Label */}
      <div className="flex flex-col">
        <span className="text-2xs uppercase tracking-[0.2em] text-on-surface-variant/70 font-black mb-1">
          Current View
        </span>
        <h2 className="text-3xl font-black font-headline text-on-surface uppercase tracking-tight">
          {currentLabel}
        </h2>
      </div>

      {/* Dropdown Selector */}
      <div ref={containerRef} className="relative w-full md:w-auto focus-within:z-10">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center justify-between md:justify-start gap-4 px-6 py-3.5 bg-surface-container-lowest backdrop-blur-sm rounded-2xl shadow-elevation-1 border border-outline-variant/50 hover:border-primary/40 hover:shadow-elevation-2 focus-within:border-primary/40 focus-within:shadow-elevation-2 focus:outline-none transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
            <span className="text-2xs uppercase tracking-widest text-on-surface-variant/50 font-bold md:hidden">
              Filter Selection
            </span>
            <span className="text-sm font-bold text-on-surface-variant">
              Change Level
            </span>
          </div>
          <Icon
            name="keyboard_arrow_down"
            className={`text-on-surface-variant/70 transition-transform duration-500 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        <div
          role="listbox"
          className={`absolute top-[calc(100%+0.75rem)] right-0 min-w-full md:min-w-[16rem] bg-surface-container-lowest shadow-elevation-2 rounded-2xl p-2 border border-outline-variant/50 z-50 overflow-hidden transition-all duration-300 ${
            open
              ? 'visible opacity-100 translate-y-0'
              : 'invisible opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={() => handleSelect('all')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-between group/item ${active === 'all'
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
          >
            <span>All JLPT Levels</span>
            {active === 'all' ? (
              <Icon name="check" className="text-base" />
            ) : (
              <Icon name="chevron_right" className="text-sm opacity-0 group-hover/item:opacity-100 translate-x-[-4px] group-hover/item:translate-x-0 transition-all" />
            )}
          </button>

          <div className="h-px bg-outline-variant/20 my-1 mx-2" />

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {available.map((level) => {
              const isActive = active === level
              return (
                <button
                  key={level}
                  onClick={() => handleSelect(level)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-between group/item ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                >
                  <span>{LEVEL_META[level].label}</span>
                  {isActive ? (
                    <Icon name="check" className="text-base" />
                  ) : (
                    <Icon name="chevron_right" className="text-sm opacity-0 group-hover/item:opacity-100 translate-x-[-4px] group-hover/item:translate-x-0 transition-all" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
