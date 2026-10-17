import type { ReactNode } from 'react'
import type { FinalTestResult } from '@/api/services/learningPathService'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useUnitSteps } from '@/hooks/useLearningPath'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { JaText } from '@/components/learn/JaText'
import { StepProgress } from '@/components/learn/StepProgress'
import { cn } from '@/lib/cn'
import { percent, type CourseUnitView } from './courseUnits'
import { finalTestMeta } from './CurriculumGroup'

/**
 * ContinueCard — the first block of the Course page: what to do next and one
 * primary button that names its target. States: first visit ("Start · Unit 1"),
 * mid-course ("Continue · Unit N"), every unit done ("Take the final test"),
 * final test passed ("View certificate").
 */
interface ContinueCardProps {
  next?: CourseUnitView
  isFresh: boolean
  finalTest?: FinalTestResult
  kanaCount: number
  className?: string
}

const CARD =
  'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6'
const CTA = 'mt-4 w-full sm:w-auto dark:bg-primary-container'

export function ContinueCard({ next, isFresh, finalTest, kanaCount, className }: ContinueCardProps) {
  const script = useKanaScript()
  const base = script.basePath
  if (finalTest?.passedAt) {
    return (
      <Shell eyebrow="Course complete" title="You passed the final test" className={className}>
        <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
          Best score {percent(finalTest.best)}. Your certificate is ready to view and print.
        </p>
        <ActionLink to={`${base}/tests#certificate`} className={CTA}>
          <Icon name="workspace_premium" className="text-xl" />
          View certificate
        </ActionLink>
      </Shell>
    )
  }

  if (!next) {
    return (
      <Shell eyebrow={`All ${script.units.length} units done`} title="Final test" className={className}>
        <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
          {finalTestMeta(script, kanaCount)}
          {finalTest ? ` · best ${percent(finalTest.best)}` : ''}
        </p>
        <ActionLink to={`${base}/test`} className={CTA}>
          <Icon name="emoji_events" className="text-xl" />
          Take the final test
        </ActionLink>
      </Shell>
    )
  }

  return <NextUnit next={next} isFresh={isFresh} className={className} />
}

function NextUnit({ next, isFresh, className }: { next: CourseUnitView; isFresh: boolean; className?: string }) {
  const { steps, done, completed } = useUnitSteps(next.unit)
  const script = useKanaScript()
  const label = `${isFresh ? 'Start' : 'Continue'} · Unit ${next.number} ${next.unit.title}`

  return (
    <Shell
      eyebrow={`Up next · Unit ${next.number} of ${script.units.length}`}
      title={next.unit.title}
      kana={next.preview.text + (next.preview.truncated ? '…' : '')}
      className={className}
    >
      <p className="mt-1 text-sm text-on-surface-variant">
        <JaText text={next.unit.summary} />
      </p>
      <StepProgress steps={steps} done={done} completed={completed} className="mt-3 max-w-sm" />
      <ActionLink to={`${script.basePath}/unit/${next.unit.id}`} className={CTA}>
        <Icon name={isFresh ? 'play_circle' : 'arrow_forward'} className="text-xl" />
        <JaText text={label} />
      </ActionLink>
    </Shell>
  )
}

interface ShellProps {
  eyebrow: string
  title: string
  kana?: string
  className?: string
  children: ReactNode
}

function Shell({ eyebrow, title, kana, className, children }: ShellProps) {
  return (
    <section aria-labelledby="continue-heading" className={cn(CARD, className)}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary tabular-nums">{eyebrow}</p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="continue-heading" className="font-headline text-xl font-bold text-on-surface md:text-2xl">
          <JaText text={title} />
        </h2>
        {kana && (
          <span lang="ja" className="whitespace-nowrap font-jp text-xl text-on-surface-variant md:text-2xl">
            {kana}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}
