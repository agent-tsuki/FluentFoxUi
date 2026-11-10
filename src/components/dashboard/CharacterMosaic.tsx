import { memo, useMemo, useState } from 'react'
import type { ItemLevelEntry, MasteryLevel } from '@/types/progress'
import { cn } from '@/lib/cn'
import { MASTERY_HINT, MASTERY_LABEL, MASTERY_LEVELS, MASTERY_TONE } from '@/lib/learn/mastery'

interface CharacterMosaicProps {
  /** Every item of a track in path order, with its level. */
  items: readonly ItemLevelEntry[]
  /** What the characters are, e.g. "Hiragana". */
  name: string
}

/**
 * Every character of a track as a tile tinted by its mastery level, so the
 * whole script reads at a glance. The level filter (with counts) doubles as
 * the legend; each tile names its level for screen readers and on hover.
 */
export const CharacterMosaic = memo(function CharacterMosaic({ items, name }: CharacterMosaicProps) {
  const [only, setOnly] = useState<MasteryLevel | null>(null)
  const counts = useMemo(() => {
    const c = Object.fromEntries(MASTERY_LEVELS.map((l) => [l, 0])) as Record<MasteryLevel, number>
    for (const item of items) c[item.level] += 1
    return c
  }, [items])
  const shown = only ? items.filter((i) => i.level === only) : items

  return (
    <div className="space-y-4">
      <div role="group" aria-label={`Filter ${name} by level`} className="flex flex-wrap gap-1.5">
        {MASTERY_LEVELS.map((level) => {
          const pressed = only === level
          return (
            <button
              key={level}
              type="button"
              aria-pressed={pressed}
              title={MASTERY_HINT[level]}
              disabled={counts[level] === 0}
              onClick={() => setOnly(pressed ? null : level)}
              className={cn(
                'flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40',
                pressed ? 'border-ink bg-ink text-surface' : 'border-line text-ink-muted hover:text-ink',
              )}
            >
              <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', MASTERY_TONE[level].fill)} />
              {MASTERY_LABEL[level]}
              <span className="tabular-nums">{counts[level]}</span>
            </button>
          )
        })}
      </div>
      <ul aria-label={`${name} characters by level`} className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
        {shown.map((item) => (
          <li
            key={item.item_id}
            title={`${item.char} · ${MASTERY_LABEL[item.level]}`}
            className={cn('flex aspect-square items-center justify-center rounded-sm border font-ja text-lg text-ink', MASTERY_TONE[item.level].soft)}
          >
            <span aria-hidden>{item.char}</span>
            <span className="sr-only">{`${item.char}: ${MASTERY_LABEL[item.level]}`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
