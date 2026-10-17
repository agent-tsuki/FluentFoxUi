import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount } from '@/lib/content/kana/scripts'
import { cn } from '@/lib/cn'
import { useCourseProgress } from './useCourseProgress'

/**
 * CourseHeader — the compact, left-aligned header shared by the four kana
 * course pages: eyebrow, h1, one line, and the course progress line.
 * `variant="course"` (the Course page) adds the meta strip and the
 * "Test out" link. The h1 takes `tabIndex={-1}` so the layout can move focus
 * to it on page change.
 */
interface CourseHeaderProps {
  variant: 'course' | 'section'
  title: string
  description: string
  /** Real kana for the progress line; `null` while the sections load. */
  allKana: readonly KanaChar[] | null
  headingRef?: Ref<HTMLHeadingElement>
  className?: string
}

export function CourseHeader({ variant, title, description, allKana, headingRef, className }: CourseHeaderProps) {
  const isCourse = variant === 'course'
  const script = useKanaScript()

  return (
    <header className={cn('pb-5 pt-6 md:pb-6 md:pt-10', className)}>
      <Eyebrow>Kana course</Eyebrow>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-headline text-display-sm font-extrabold tracking-tight text-on-surface focus:outline-none"
      >
        {title}
      </h1>
      <p className="mt-1 max-w-prose text-base text-on-surface-variant">{description}</p>

      {isCourse && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6">
          <p className="py-1 text-sm text-on-surface-variant">
            {script.units.length} units · {allKana?.length || scriptKanaCount(script)} kana · Final test &amp; certificate
          </p>
          <Link
            to={`${script.basePath}/skip/all`}
            className="-ml-2 inline-flex min-h-11 items-center gap-0.5 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Already know {script.label.toLowerCase()}? Test out
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        </div>
      )}

      <div className={isCourse ? 'mt-1' : 'mt-4'}>
        {allKana ? <ProgressLine allKana={allKana} /> : <SkeletonBlock className="h-5 w-72 max-w-full rounded-xl" />}
      </div>
    </header>
  )
}

function ProgressLine({ allKana }: { allKana: readonly KanaChar[] }) {
  const { unitsDone, unitsTotal, kanaMastered, kanaTotal } = useCourseProgress(allKana)
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
          {kanaMastered} / {kanaTotal}
        </span>{' '}
        kana mastered
      </p>
    </div>
  )
}
