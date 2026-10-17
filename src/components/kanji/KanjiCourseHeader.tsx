import type { Ref } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { KanjiLevelIndex } from '@/types/kanji'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { KANJI_LEVELS, kanjiLevelPath, kanjiSkipPath } from '@/lib/content/kanji/levels'
import { cn } from '@/lib/cn'
import { useKanjiCourseUnits } from './kanjiUnits'

/**
 * KanjiCourseHeader — the header shared by a level's pages: eyebrow, h1, the
 * level switcher, one line, and the progress line. `variant="course"` adds
 * the meta strip and the "Test out" link (same layout as the kana header).
 */
interface KanjiCourseHeaderProps {
  variant: 'course' | 'section'
  title: string
  description: string
  index: KanjiLevelIndex | null
  headingRef?: Ref<HTMLHeadingElement>
}

export function KanjiCourseHeader({ variant, title, description, index, headingRef }: KanjiCourseHeaderProps) {
  const level = useKanjiLevel()
  const isCourse = variant === 'course'

  return (
    <header className="pb-5 pt-6 md:pb-6 md:pt-10">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <Eyebrow>Kanji course</Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-headline text-display-sm font-extrabold tracking-tight text-on-surface focus:outline-none"
          >
            {title}
          </h1>
        </div>
        <KanjiLevelSwitcher />
      </div>
      <p className="mt-1 max-w-prose text-base text-on-surface-variant">{description}</p>

      {isCourse && index && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6">
          <p className="py-1 text-sm tabular-nums text-on-surface-variant">
            {index.units.length} units · {index.rows.length} kanji · Level test &amp; certificate
          </p>
          <Link
            to={kanjiSkipPath(level.id, 'all')}
            className="-ml-2 inline-flex min-h-11 items-center gap-0.5 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Know {level.label}? Test out
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        </div>
      )}

      <div className={isCourse ? 'mt-1' : 'mt-4'}>
        {index ? <ProgressLine index={index} /> : <SkeletonBlock className="h-5 w-72 max-w-full rounded-xl" />}
      </div>
    </header>
  )
}

function ProgressLine({ index }: { index: KanjiLevelIndex }) {
  const { unitsDone, kanjiMastered } = useKanjiCourseUnits(index)
  const unitsTotal = index.units.length
  return (
    <div className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <ProgressBar
        value={unitsDone}
        max={unitsTotal}
        label="Units finished"
        valueText={`${unitsDone} of ${unitsTotal} units finished`}
        className="sm:w-40 sm:shrink-0"
      />
      <p className="text-sm tabular-nums text-on-surface-variant">
        <span className="font-semibold text-on-surface">
          {unitsDone} / {unitsTotal}
        </span>{' '}
        units ·{' '}
        <span className="font-semibold text-on-surface">
          {kanjiMastered} / {index.rows.length}
        </span>{' '}
        kanji mastered
      </p>
    </div>
  )
}

/**
 * KanjiLevelSwitcher — N5 · N4 · N3 … as links. Coming-soon levels stay
 * visible (with "Soon") and lead to their placeholder page; nothing is locked.
 */
export function KanjiLevelSwitcher({ className }: { className?: string }) {
  return (
    <nav aria-label="JLPT level" className={cn('-mx-1', className)}>
      <ul className="flex flex-wrap gap-1.5">
        {KANJI_LEVELS.map((l) => (
          <li key={l.id}>
            <NavLink
              to={kanjiLevelPath(l.id)}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                )
              }
            >
              {l.label}
              {l.status === 'coming-soon' && <span className="text-xs font-medium text-on-surface-variant">Soon</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Source credit for kanji data, shown on every kanji screen that uses it. */
export function KanjiDataCredit({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-on-surface-variant', className)}>
      Kanji data:{' '}
      <a
        href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-outline underline-offset-2 hover:text-on-surface"
      >
        KANJIDIC2
      </a>{' '}
      and{' '}
      <a
        href="https://www.edrdg.org/jmdict/j_jmdict.html"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-outline underline-offset-2 hover:text-on-surface"
      >
        JMdict
      </a>{' '}
      (EDRDG, CC BY-SA 4.0) · Strokes:{' '}
      <a
        href="https://kanjivg.tagaini.net"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-outline underline-offset-2 hover:text-on-surface"
      >
        KanjiVG
      </a>{' '}
      (CC BY-SA 3.0)
    </p>
  )
}
