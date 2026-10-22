import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { CLASS_PLATFORMS, PLATFORM_META } from '@/lib/classes/platformMeta'
import type { JlptLevel } from '@/types'
import type { ClassLevelAvailability, ClassPlatform } from '@/types/classes'

interface ClassesFilterBarProps {
  levels: ClassLevelAvailability[]
  level: JlptLevel
  platform: ClassPlatform | null
  freeOnly: boolean
  onLevelChange: (level: JlptLevel) => void
  onPlatformChange: (platform: ClassPlatform | null) => void
  onFreeOnlyChange: (freeOnly: boolean) => void
}

const CHIP =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-colors duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
const CHIP_ON = 'border-primary bg-primary/10 text-primary'
const CHIP_OFF = 'border-outline-variant/60 text-on-surface-variant hover:border-outline hover:text-on-surface'

/** ClassesFilterBar — sticky JLPT level tabs, platform chips and the "Free only" toggle. */
export function ClassesFilterBar(props: ClassesFilterBarProps) {
  const { levels, level, platform, freeOnly, onLevelChange, onPlatformChange, onFreeOnlyChange } = props
  return (
    <div className="sticky top-nav z-30 border-b border-outline-variant/40 bg-surface/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between md:px-10">
        <div role="group" aria-label="JLPT level" className="flex w-fit items-center gap-1 rounded-xl bg-surface-container p-1">
          {levels.map(l => {
            const active = l.level === level
            return (
              <button
                key={l.level}
                type="button"
                aria-pressed={active}
                aria-label={l.locked ? `${l.level}, coming soon` : `${l.level}, ${l.count} courses`}
                onClick={() => onLevelChange(l.level)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-1 rounded-xl px-4 text-sm font-bold transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active ? 'bg-primary text-on-primary shadow-elevation-1' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                {l.level}
                {l.locked && <Icon name="lock" className="text-sm opacity-70" />}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={platform === null} onClick={() => onPlatformChange(null)} className={cn(CHIP, platform === null ? CHIP_ON : CHIP_OFF)}>
            <Icon name="filter_list" className="text-sm" />
            All platforms
          </button>
          {CLASS_PLATFORMS.map(p => {
            const meta = PLATFORM_META[p]
            const active = platform === p
            return (
              <button key={p} type="button" aria-pressed={active} onClick={() => onPlatformChange(p)} className={cn(CHIP, active ? CHIP_ON : CHIP_OFF)}>
                <Icon name={meta.icon} className={cn('text-sm', !active && meta.colorClass)} />
                {meta.label}
              </button>
            )
          })}
          <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-outline-variant/60 sm:block" />
          <button type="button" aria-pressed={freeOnly} onClick={() => onFreeOnlyChange(!freeOnly)} className={cn(CHIP, freeOnly ? 'border-success bg-success/10 text-success' : CHIP_OFF)}>
            <Icon name={freeOnly ? 'check_circle' : 'radio_button_unchecked'} className="text-sm" />
            Free only
          </button>
        </div>
      </div>
    </div>
  )
}
