import type { Ref } from 'react'
import { NavLink } from 'react-router-dom'
import type { KanjiLevelIndex } from '@/types/kanji'
import { LessonHeader } from '@/components/lesson/LessonHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { KANJI_LEVELS, kanjiLevelPath } from '@/lib/content/kanji/levels'
import { useKanjiOverlayLink } from './kanjiOverlays'
import { cn } from '@/lib/cn'
import { useKanjiCourseUnits } from './kanjiUnits'
import { TextLink } from '@/components/ui/TextLink'

/**
 * KanjiCourseHeader: the LessonHeader of a level's pages, with the level
 * switcher and the progress line. `variant="course"` adds
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
  const overlayLink = useKanjiOverlayLink()
  const isCourse = variant === 'course'

  return (
    <LessonHeader
      crumbs={title === level.title ? [{ label: 'Kanji', to: '/kanji' }, { label: level.title }] : [{ label: 'Kanji', to: '/kanji' }, { label: level.title, to: kanjiLevelPath(level.id) }, { label: title }]}
      title={title}
      description={description}
      headingRef={headingRef}
      className="pb-5 pt-6 md:pb-6 md:pt-8"
    >
      <KanjiLevelSwitcher />
      {isCourse && index && (
        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <p className="py-1 text-caption tabular-nums text-ink-muted">
            {index.units.length} units · {index.rows.length} kanji · Level test &amp; certificate
          </p>
          <TextLink to={overlayLink({ skip: 'all' })} leadingIcon="fast_forward">
            Know {level.label}? Test out
          </TextLink>
        </div>
      )}
      {index ? <ProgressLine index={index} /> : <SkeletonBlock className="h-5 w-72 max-w-full rounded-md" />}
    </LessonHeader>
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
      <p className="text-sm tabular-nums text-ink-muted">
        <span className="font-semibold text-ink">
          {unitsDone} / {unitsTotal}
        </span>{' '}
        units ·{' '}
        <span className="font-semibold text-ink">
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
                  'inline-flex min-h-touch-target items-center gap-1.5 rounded-md px-3 text-label transition-colors duration-fast',
                  isActive ? 'bg-primary-soft text-primary-ink' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                )
              }
            >
              {l.label}
              {l.status === 'coming-soon' && <span className="text-xs font-medium text-ink-subtle">Coming soon</span>}
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
    <p className={cn('text-xs text-ink-muted', className)}>
      Kanji data:{' '}
      <a
        href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-line-strong underline-offset-2 hover:text-ink"
      >
        KANJIDIC2
      </a>{' '}
      and{' '}
      <a
        href="https://www.edrdg.org/jmdict/j_jmdict.html"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-line-strong underline-offset-2 hover:text-ink"
      >
        JMdict
      </a>{' '}
      (EDRDG, CC BY-SA 4.0) · Strokes:{' '}
      <a
        href="https://kanjivg.tagaini.net"
        target="_blank"
        rel="noopener noreferrer"
        className="-my-2 inline-block py-2 underline decoration-line-strong underline-offset-2 hover:text-ink"
      >
        KanjiVG
      </a>{' '}
      (CC BY-SA 3.0)
    </p>
  )
}
