import { useLearningPath } from '@/hooks/useLearningPath'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { TestsStatus } from '@/components/kanaCourse/TestsStatus'
import { formatPercent } from '@/components/kanaCourse/testsPercent'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount } from '@/lib/content/kana/scripts'
import { cn } from '@/lib/cn'

interface FinalTestCardProps {
  className?: string
}

/**
 * The script's final test on the Tests page: every kana, against the clock
 * (hiragana: 104 kana, 14 min, 80 % to pass). Never locked. Passing it (or the "all" test-out) unlocks the certificate.
 */
export function FinalTestCard({ className }: FinalTestCardProps) {
  const script = useKanaScript()
  const lower = script.label.toLowerCase()
  const { finalTest } = useLearningPath()
  const passed = Boolean(finalTest?.passedAt)
  const taken = finalTest !== undefined && (finalTest.best > 0 || passed)

  return (
    <article
      aria-labelledby="final-test-title"
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-4 sm:flex-row sm:items-center sm:p-5 lg:flex-col lg:items-stretch',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/15"
        >
          <Icon name="emoji_events" className="text-2xl" />
        </span>
        <div className="min-w-0">
          <h3 id="final-test-title" className="font-display text-lg font-bold text-ink">
            Final {lower} test
          </h3>
          <p className="text-sm tabular-nums text-ink-muted">
            All {scriptKanaCount(script)} {lower} · {script.finalTest.minutes} min · {formatPercent(script.finalTest.passMark)} to pass
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Open any time. We suggest it after the {script.units.length} units.
          </p>
        </div>
      </div>
      {/* Beside the text on tablets; under it in the narrow ≥ lg rail. */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2 lg:flex-row lg:items-center lg:justify-between">
        <TestsStatus best={taken ? finalTest?.best : undefined} passed={passed} />
        <ActionLink to={`${script.basePath}/test`} variant={passed ? 'outline' : 'primary'} className="px-4 text-sm">
          {taken ? 'Retake test' : 'Start test'}
          <span aria-hidden className="flex">
            <Icon name="arrow_forward" className="text-lg" />
          </span>
        </ActionLink>
      </div>
    </article>
  )
}
