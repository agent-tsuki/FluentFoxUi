import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { JLPT_LEVELS, CHAPTER_TABS, isLevelAvailable, jlptLevel, chapterPath, jlptLevelOf, type JlptLevelId } from '@/lib/content/jlpt/levels'


/**
 * The navbar's JLPT menu (desktop). Levels run down the left, N5 at the top
 * to N1; pointing at or clicking one shows on the right what every chapter of
 * it has: Grammar, Vocabulary, Exercise and Listening (each opens chapter 1 on that tab;
 * the chapter list stays on the left of those pages). Levels not ready yet say
 * a lock. Arrow keys move between levels; Escape closes (focus on the button).
 */
export function JlptMegaMenu({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const [active, setActive] = useState<JlptLevelId>(() => jlptLevelOf(pathname) ?? 'n5')
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const levelButtons = useRef<Partial<Record<JlptLevelId, HTMLButtonElement | null>>>({})
  const panelId = useId()

  // A navigation (including picking a link) closes it; reopening starts on the level you're in.
  useEffect(() => {
    setOpen(false)
    const here = jlptLevelOf(pathname)
    if (here) setActive(here)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Up / Down move between levels (and show them), Home / End jump to the ends.
  const onLevelKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const at = JLPT_LEVELS.findIndex((l) => l.id === active)
    const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: JLPT_LEVELS.length - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    const next = JLPT_LEVELS[(to + JLPT_LEVELS.length) % JLPT_LEVELS.length]
    setActive(next.id)
    levelButtons.current[next.id]?.focus()
  }

  const level = jlptLevel(active)

  return (
    <div ref={root} className="relative group">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'flex items-center gap-1 cursor-pointer transition-all duration-200 group-hover:scale-105',
          open || jlptLevelOf(pathname) ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface',
        )}
      >
        {label}
        <Icon name="keyboard_arrow_down" className={cn('text-xs transition-transform', open && 'rotate-180')} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-[calc(100%+0.75rem)] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-2 normal-case tracking-normal shadow-elevation-3 dark:bg-surface-container-low"
      >
        <div className="flex gap-2">
          {/* Levels, N5 → N1 */}
          <ul aria-label="JLPT levels" className="w-44 shrink-0 space-y-0.5 border-r border-outline-variant/40 py-1 pr-2">
            {JLPT_LEVELS.map((l) => {
              const on = l.id === active
              const soon = !isLevelAvailable(l.id)
              return (
                <li key={l.id}>
                  <button
                    ref={(el) => {
                      levelButtons.current[l.id] = el
                    }}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(l.id)}
                    onMouseEnter={() => setActive(l.id)}
                    onFocus={() => setActive(l.id)}
                    onKeyDown={onLevelKey}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      on ? 'bg-primary/10' : 'hover:bg-surface-container',
                    )}
                  >
                    <span className={cn('font-headline text-lg font-extrabold', on ? 'text-primary' : soon ? 'text-on-surface-variant/60' : 'text-on-surface')}>
                      {l.label}
                    </span>
                    <span className={cn('flex-1 text-sm font-semibold', soon ? 'text-on-surface-variant/60' : 'text-on-surface-variant')}>{l.name}</span>
                    {soon ? (
                      <LockedMark />
                    ) : (
                      <Icon name="chevron_right" className={cn('text-lg', on ? 'text-primary' : 'text-on-surface-variant/60')} />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* The chosen level's parts */}
          <div aria-live="polite" className="min-w-0 flex-1 p-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-headline text-base font-bold text-on-surface">
                  {level.label} · {level.name}
                </p>
                <p className="text-xs text-on-surface-variant">{level.summary}</p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {CHAPTER_TABS.map((section) => {
                const available = isLevelAvailable(active)
                const body = (
                  <>
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        available ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant/60',
                      )}
                    >
                      <Icon name={section.icon} className="text-xl" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn('text-sm font-bold', available ? 'text-on-surface' : 'text-on-surface-variant/70')}>{section.title}</span>
                        {!available && <LockedMark />}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-on-surface-variant">{section.summary}</span>
                    </span>
                  </>
                )
                return (
                  <li key={section.id}>
                    {available ? (
                      <Link
                        to={chapterPath(active, 1, section.id)}
                        onClick={() => setOpen(false)}
                        className="flex h-full items-start gap-3 rounded-xl border border-outline-variant/50 p-3 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-outline/50"
                      >
                        {body}
                        <span className="sr-only">, {level.label}</span>
                      </Link>
                    ) : (
                      <span
                        aria-disabled
                        className="flex h-full items-start gap-3 rounded-xl border border-dashed border-outline-variant/50 p-3 dark:border-outline/50"
                      >
                        {body}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm dark:bg-surface-container">
          <span className="text-on-surface-variant">Not sure of your level?</span>
          <Link
            to="/quiz"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 rounded-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="bolt" className="text-base" />
            Take a practice test
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Marks a level or part that is not ready yet. */
function LockedMark() {
  return (
    <span className="inline-flex shrink-0 items-center text-on-surface-variant/60" title="Coming soon">
      <Icon name="lock" className="text-base" />
      <span className="sr-only">, coming soon</span>
    </span>
  )
}
