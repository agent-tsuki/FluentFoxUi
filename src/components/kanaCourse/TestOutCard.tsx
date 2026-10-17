import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount } from '@/lib/content/kana/scripts'
import { cn } from '@/lib/cn'
import { TestsStatus } from './TestsStatus'

interface TestOutCardProps {
  /** Best "all" skip-test score, 0–1. */
  best?: number
  /** Primary emphasis: used on a first visit, before any unit is done. */
  emphasis: boolean
  /** The certificate is already unlocked (final test passed). */
  certificateUnlocked: boolean
  className?: string
}

/**
 * TestOutCard — the "All <script>" test-out on the Tests page. One link to
 * /skip/all; its CTA is a styled span (no nested interactive elements).
 */
export function TestOutCard({ best, emphasis, certificateUnlocked, className }: TestOutCardProps) {
  const script = useKanaScript()
  const passed = best !== undefined && best >= script.skipPassMark
  return (
    <Link
      to={`${script.basePath}/skip/all`}
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border p-4 text-left transition-colors duration-150 sm:flex-row sm:items-center sm:p-5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        emphasis
          ? 'border-primary/50 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15'
          : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low dark:border-outline/60 dark:bg-surface-container-low dark:hover:bg-surface-container',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15"
        >
          <Icon name="school" className="text-2xl" />
        </span>
        <span className="min-w-0">
          <span className="block font-headline text-lg font-bold text-on-surface">All {script.label.toLowerCase()}</span>
          <span className="block text-sm tabular-nums text-on-surface-variant">
            {scriptKanaCount(script)} kana · {script.units.length} units
          </span>
          <span className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
            <span aria-hidden className="flex">
              <Icon name="workspace_premium" className="text-base text-primary" />
            </span>
            {certificateUnlocked ? 'Your certificate is unlocked.' : 'Pass this to unlock your certificate too.'}
          </span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
        <TestsStatus best={best} passed={passed} />
        <span
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold transition-shadow',
            emphasis
              ? 'bg-primary text-on-primary shadow-elevation-1 group-hover:shadow-elevation-2'
              : 'border-2 border-outline-variant/60 text-on-surface dark:border-outline/60',
          )}
        >
          {best === undefined ? 'Start test' : 'Retake'}
          <span aria-hidden className="flex">
            <Icon name="arrow_forward" className="text-lg transition-transform motion-safe:group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  )
}
