import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { Icon } from '@/components/ui/Icon'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/cn'
import { JaText } from '@/components/learn/JaText'
import { StepProgress } from '@/components/learn/StepProgress'
import { CourseMenuDrawer } from '@/components/learn/CourseMenuDrawer'
import type { UnitStep } from '@/api/services/learningPathService'

interface UnitHeaderProps {
  unit: KanaUnit
  index: number
  total: number
  prev?: KanaUnit
  next?: KanaUnit
  steps: UnitStep[]
  done: Record<UnitStep, boolean>
  completed: number
  /** Real kana by id, for the course menu's kana previews. */
  kanaById: ReadonlyMap<string, KanaChar>
}

const NAV_LINK = cn(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-on-surface-variant transition-colors',
  'hover:bg-surface-container-low hover:text-on-surface',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
)

/** Unit page header: back link, course menu, prev/next unit, "Unit X of N", title, summary and step progress. */
export function UnitHeader({ unit, index, total, prev, next, steps, done, completed, kanaById }: UnitHeaderProps) {
  const script = useKanaScript()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  return (
    <header className="mb-10 md:mb-14">
      <nav aria-label="Unit navigation" className="-mx-3 mb-6 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center">
          <Link to={`${script.basePath}/learn#unit-${unit.id}`} className={NAV_LINK}>
            <span aria-hidden className="flex">
              <Icon name="chevron_left" className="text-xl" />
            </span>
            {script.label} course
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label="Course menu"
            className={NAV_LINK}
          >
            <span aria-hidden className="flex">
              <Icon name="menu_book" className="text-lg" />
            </span>
            <span aria-hidden className="hidden sm:inline">
              Course menu
            </span>
          </button>
        </span>
        <span className="flex shrink-0 items-center">
          {prev && (
            <Link to={`${script.basePath}/unit/${prev.id}`} className={NAV_LINK} aria-label={`Previous unit: ${prev.title}`}>
              <Icon name="arrow_back" className="text-lg" />
              <span className="hidden sm:inline">
                <JaText text={prev.title} />
              </span>
            </Link>
          )}
          {next && (
            <Link to={`${script.basePath}/unit/${next.id}`} className={NAV_LINK} aria-label={`Next unit: ${next.title}`}>
              <span className="hidden sm:inline">
                <JaText text={next.title} />
              </span>
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
          )}
        </span>
      </nav>

      <Eyebrow>
        Unit {index} of {total}
      </Eyebrow>
      <h1 className="font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-tight tracking-tight text-on-surface">
        <JaText text={unit.title} />
      </h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-on-surface-variant">
        <JaText text={unit.summary} />
      </p>
      <StepProgress steps={steps} done={done} completed={completed} className="mt-6 max-w-sm" />
      <CourseMenuDrawer open={menuOpen} onClose={closeMenu} currentUnitId={unit.id} kanaById={kanaById} />
    </header>
  )
}
