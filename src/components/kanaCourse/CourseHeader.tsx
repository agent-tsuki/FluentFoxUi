import type { Ref } from 'react'
import type { KanaChar } from '@/types'
import { LessonHeader } from '@/components/lesson/LessonHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount } from '@/lib/content/kana/scripts'
import { cn } from '@/lib/cn'
import { useCourseProgress } from './useCourseProgress'
import { TextLink } from '@/components/ui/TextLink'

/**
 * CourseHeader: the LessonHeader of the four kana course pages, with the
 * course progress line.
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
    <LessonHeader
      crumbs={[{ label: 'Kana', to: '/kana/hiragana' }, { label: script.label, to: script.basePath }, { label: title }]}
      title={title}
      description={description}
      headingRef={headingRef}
      className={cn('pb-5 pt-6 md:pb-6 md:pt-8', className)}
    >
      {isCourse && (
        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <p className="py-1 text-caption text-ink-muted">
            {script.units.length} units · {allKana?.length || scriptKanaCount(script)} kana · Final test &amp; certificate
          </p>
          <TextLink to={`${script.basePath}/skip/all`} leadingIcon="fast_forward">
            Already know {script.label.toLowerCase()}? Test out
          </TextLink>
        </div>
      )}
      {allKana ? <ProgressLine allKana={allKana} /> : <SkeletonBlock className="h-5 w-72 max-w-full rounded-md" />}
    </LessonHeader>
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
      <p className="text-sm tabular-nums text-ink-muted">
        <span className="font-semibold text-ink">
          {unitsDone} / {unitsTotal}
        </span>{' '}
        units ·{' '}
        <span className="font-semibold text-ink">
          {kanaMastered} / {kanaTotal}
        </span>{' '}
        kana mastered
      </p>
    </div>
  )
}
