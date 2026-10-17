import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { HIRAGANA_UNITS } from '@/lib/content/kana/hiraganaUnits'
import { lookAlikeSetsFor, lookAlikeSetsTouching } from '@/lib/content/kana/lookAlikeSets'
import { KANA_MARK_IDS } from '@/lib/content/kana/kanaMarks'

const MODES = [
  { id: 'review', title: 'Swipe review', icon: 'style', minutes: 2, description: 'Flip through due kana and rate how well you knew each.' },
  { id: 'listen', title: 'Listen & tap', icon: 'headset', minutes: 2, description: 'Hear a sound, tap the kana that matches it.' },
  { id: 'build', title: 'Word builder', icon: 'translate', minutes: 3, description: 'Spell real words from kana tiles.' },
  { id: 'speed', title: 'Speed round', icon: 'timer', minutes: 1, description: 'Read as many kana as you can before time runs out.' },
  { id: 'lookalike', title: 'Look-alikes', icon: 'difference', minutes: 2, description: 'Tell confusable kana apart, with a tip for each set.' },
  { id: 'match', title: 'Kana match', icon: 'compare_arrows', minutes: 2, description: 'Pair each hiragana with its katakana twin.' },
] as const

type ModeId = (typeof MODES)[number]['id']

/** Kana ids with a hiragana form: the ones the hiragana ↔ katakana match can pair. */
const PAIRABLE_IDS = new Set(HIRAGANA_UNITS.flatMap((u) => u.kanaIds))

/**
 * Whether a mode has anything to play for this script (and unit): the
 * look-alike drill needs look-alike sets, the match needs kana with a twin.
 */
function isAvailable(id: ModeId, script: KanaScriptConfig, unitId: string | undefined): boolean {
  const unit = unitId ? script.units.find((u) => u.id === unitId) : undefined
  if (id === 'lookalike') {
    return unit ? lookAlikeSetsTouching(script.id, unit.kanaIds).length > 0 : lookAlikeSetsFor(script.id).length > 0
  }
  if (id === 'match') return unit ? unit.kanaIds.some((k) => PAIRABLE_IDS.has(k)) : true
  // ー and small ッ have no sound or romaji alone: nothing to hear or type in their unit.
  if (id === 'listen' || id === 'speed') return !unit || unit.kanaIds.some((k) => !KANA_MARK_IDS.has(k))
  return true
}

interface PracticeModeListProps {
  /** Limit every mode to one path unit (`?unit=<id>`); the session returns to that unit. */
  unitId?: string
  /** Optional per-mode note, e.g. "Best for the basic rows". */
  hints?: Partial<Record<ModeId, string>>
  /** 'wide' = 3 across on large screens (chart page); 'narrow' = max 2 across (unit page). */
  layout?: 'wide' | 'narrow'
  /**
   * 'card' (default) = full link cards with a description; 'compact' = small
   * icon + title links, two across (the Course page practice block and rail).
   * Pass extra breakpoint columns for compact via `className` (e.g. `sm:grid-cols-3`).
   */
  variant?: 'card' | 'compact'
  className?: string
}

/** The practice modes as link cards. Used by the chart page, the Course page and each unit page. */
export function PracticeModeList({ unitId, hints, layout = 'wide', variant = 'card', className }: PracticeModeListProps) {
  const query = unitId ? `?unit=${encodeURIComponent(unitId)}` : ''
  const script = useKanaScript()
  const practiceBase = `${script.basePath}/practice`
  const modes = MODES.filter((mode) => isAvailable(mode.id, script, unitId))

  if (variant === 'compact') {
    return (
      <ul className={cn('grid grid-cols-2 gap-2 text-left', className)}>
        {modes.map((mode) => (
          <li key={mode.id}>
            <Link
              to={`${practiceBase}/${mode.id}${query}`}
              className={cn(
                'flex h-full min-h-12 items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-2.5 py-2 transition-colors duration-150',
                'hover:border-primary/40 hover:bg-surface-container-low dark:border-outline/60 dark:bg-surface-container-low dark:hover:bg-surface-container',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              )}
            >
              <span aria-hidden className="flex shrink-0">
                <Icon name={mode.icon} className="text-xl text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-on-surface">{mode.title}</span>
                <span className="block text-xs tabular-nums text-on-surface-variant">{mode.minutes} min</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-left',
        layout === 'wide' && 'lg:grid-cols-3',
        className,
      )}
    >
      {modes.map((mode) => (
        <li key={mode.id}>
          <Link
            to={`${practiceBase}/${mode.id}${query}`}
            className={cn(
              'group flex h-full min-h-20 items-center gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-elevation-1 transition duration-200 ease-out',
              'sm:flex-col sm:items-start sm:p-5',
              'hover:border-primary/40 hover:shadow-elevation-2 motion-safe:hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon name={mode.icon} className="text-2xl text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-headline font-bold text-on-surface">{mode.title}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant">
                  <Icon name="schedule" className="text-sm" />
                  {mode.minutes} min
                </span>
              </span>
              <span className="mt-1 block text-sm leading-snug text-on-surface-variant">{mode.description}</span>
              {hints?.[mode.id] && (
                <span className="mt-1.5 block text-xs font-medium text-on-surface-variant">
                  {hints[mode.id]}
                </span>
              )}
            </span>
            <Icon
              name="chevron_right"
              className="text-xl text-on-surface-variant transition-transform group-hover:translate-x-0.5 sm:hidden"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
