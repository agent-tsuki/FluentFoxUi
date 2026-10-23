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

/** Controls are 32px tall; the invisible ::after extends the hit area to 44px. */
const HIT_AREA = "relative after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-['']"
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

const CHIP = cn(
  'inline-flex h-8 min-w-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-bold transition-colors duration-200',
  HIT_AREA,
  FOCUS,
)
const CHIP_ON = 'border-primary bg-primary/10 text-primary'
const CHIP_OFF = 'border-outline-variant/60 text-on-surface-variant hover:border-outline hover:text-on-surface'

/**
 * ClassesFilterBar — JLPT level segmented control, platform chips and the
 * "Free only" toggle. One 48px row on desktop; on phones the chips get their
 * own horizontally scrolling row.
 */
export function ClassesFilterBar(props: ClassesFilterBarProps) {
  const { levels, level, platform, freeOnly, onLevelChange, onPlatformChange, onFreeOnlyChange } = props
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex flex-col gap-2 border-y border-outline-variant/40 py-2 md:h-12 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
        <div role="group" aria-label="JLPT level" className="flex w-fit items-center rounded-xl bg-surface-container p-0.5">
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
                  'inline-flex h-8 min-w-11 items-center justify-center gap-0.5 rounded-lg px-3 text-xs font-bold transition-colors duration-200',
                  HIT_AREA,
                  FOCUS,
                  active ? 'bg-primary text-on-primary shadow-elevation-1' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                {l.level}
                {l.locked && <Icon name="lock" className="text-xs opacity-70" />}
              </button>
            )
          })}
        </div>

        {/* py-1.5 on phones keeps the 44px hit areas inside the scroll container (it clips overflow). */}
        <div
          role="group"
          aria-label="Platform and price"
          className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 py-1.5 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:py-0 [&::-webkit-scrollbar]:hidden"
        >
          <button type="button" aria-pressed={platform === null} onClick={() => onPlatformChange(null)} className={cn(CHIP, platform === null ? CHIP_ON : CHIP_OFF)}>
            All
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
          <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline-variant/60" />
          <button
            type="button"
            aria-pressed={freeOnly}
            onClick={() => onFreeOnlyChange(!freeOnly)}
            className={cn(CHIP, freeOnly ? 'border-success bg-success/10 text-success' : CHIP_OFF)}
          >
            <Icon name={freeOnly ? 'check_circle' : 'radio_button_unchecked'} className="text-sm" />
            Free only
          </button>
        </div>
      </div>
    </div>
  )
}
