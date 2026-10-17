import { useRef, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { KanaMastery } from '@/types/kanaProgress'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { MASTERY_SURFACE, MasteryMarks } from './CharCard'
import { MASTERY_LABEL, MASTERY_LEVELS } from '@/lib/learn/mastery'

/** 'all', or a set's `?set=` value from the script's chart sets (e.g. 'basic', 'yoon'). */
export type ChartSet = string

export interface ChartSetOption {
  value: ChartSet
  /** Visible label, e.g. "Basic". */
  label: string
  /** Real kana in the set; shown after the label from `sm` up. */
  count?: number
}

interface ChartSetSwitcherProps {
  options: readonly ChartSetOption[]
  value: ChartSet
  onChange: (value: ChartSet) => void
}

/** One equal column per option ("All" + one per data section). */
const SWITCHER_COLUMNS: Readonly<Record<number, string>> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

/**
 * Segmented control for the visible kana set. A radiogroup with a roving
 * tabindex: Tab enters on the checked option, arrows / Home / End move and select.
 */
export function ChartSetSwitcher({ options, value, onChange }: ChartSetSwitcherProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const columns = SWITCHER_COLUMNS[options.length] ?? SWITCHER_COLUMNS[4]

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % options.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = options.length - 1
    if (next < 0) return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Kana set"
      className={cn(
        'grid h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-1 dark:border-outline/60 dark:bg-surface-container-low sm:inline-grid sm:w-auto',
        columns,
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition-colors sm:px-3.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
              checked ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn('hidden tabular-nums sm:inline', checked ? 'text-on-primary/85' : 'text-on-surface-variant')}>
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}


/** Key for the cell states, with counts for the visible set. Swatches reuse the cell classes. */
export function MasteryLegend({ counts }: { counts: Record<KanaMastery, number> }) {
  return (
    <ul aria-label="Progress key" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant">
      {MASTERY_LEVELS.map((mastery) => (
        <li key={mastery} className="flex items-center gap-1.5">
          <span aria-hidden className={cn('relative block h-5 w-5 shrink-0 rounded-md border', MASTERY_SURFACE[mastery])}>
            <MasteryMarks mastery={mastery} className="right-0.5 top-0.5" />
          </span>
          <span>
            {MASTERY_LABEL[mastery]} <span className="font-semibold tabular-nums text-on-surface">{counts[mastery]}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

interface ChartToolbarProps extends ChartSetSwitcherProps {
  counts: Record<KanaMastery, number>
  hideRomaji: boolean
  onToggleRomaji: () => void
  downloadsTo: string
}

/** The chart's toolbar: set switcher, mastery key, hide-romaji toggle and poster link. */
export function ChartToolbar({ counts, hideRomaji, onToggleRomaji, downloadsTo, ...switcher }: ChartToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        <ChartSetSwitcher {...switcher} />
        <MasteryLegend counts={counts} />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          aria-pressed={hideRomaji}
          onClick={onToggleRomaji}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            hideRomaji
              ? 'border-primary/60 bg-primary/10 text-on-surface'
              : 'border-outline-variant text-on-surface-variant hover:text-on-surface dark:border-outline/60',
          )}
        >
          <span aria-hidden className="flex">
            <Icon name={hideRomaji ? 'visibility_off' : 'visibility'} className="text-lg" />
          </span>
          Hide romaji
        </button>
        <Link
          to={downloadsTo}
          className="inline-flex min-h-11 items-center gap-0.5 rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Download poster
          <span aria-hidden className="flex">
            <Icon name="chevron_right" className="text-lg" />
          </span>
        </Link>
      </div>
    </div>
  )
}
