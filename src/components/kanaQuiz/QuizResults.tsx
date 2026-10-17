import type { ReactNode } from 'react'
import type { KanaChar } from '@/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'

interface QuizResultsProps {
  correct: number
  total: number
  passed: boolean
  /** Extra lines under the score, e.g. time taken. */
  detail?: ReactNode
  /** Pass mark shown on the "Not yet" chip, 0–1. Defaults to the script's unit-quiz pass mark. */
  passMark?: number
  /** A breakdown between the score and the missed kana, e.g. per-unit results. */
  breakdown?: ReactNode
  /** Kana answered wrong (deduplicated by the caller or here). */
  missed: KanaChar[]
  missedTitle?: string
  /** A link or action next to the missed kana, e.g. "Review the unit". */
  missedAction?: ReactNode
  /** Main buttons (Retry, Back…). */
  actions: ReactNode
  /** Anything after the buttons, e.g. the certificate panel. */
  children?: ReactNode
}

/** Score, pass/fail against the pass mark, the kana to revisit, then the next steps. */
export function QuizResults({ correct, total, passed, detail, passMark: passMarkProp, breakdown, missed, missedTitle = 'Kana to revisit', missedAction, actions, children }: QuizResultsProps) {
  const script = useKanaScript()
  const passMark = passMarkProp ?? script.unitQuizPassMark
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0
  const unique = [...new Map(missed.map((k) => [k.id, k])).values()]
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div role="status" className="flex flex-col items-center gap-3 pt-4 text-center">
        <Icon name={passed ? 'emoji_events' : 'school'} className={cn('text-5xl', passed ? 'text-primary' : 'text-on-surface-variant')} />
        <p className="font-headline text-5xl font-extrabold tabular-nums text-on-surface">{percent}%</p>
        <p className="text-on-surface-variant">
          {correct} of {total} correct
        </p>
        <p className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold', passed ? 'bg-success/15 text-success' : 'bg-surface-container-high text-on-surface')}>
          <Icon name={passed ? 'check_circle' : 'refresh'} filled={passed} className="text-lg" />
          {passed ? 'Passed' : `Not yet — ${Math.round(passMark * 100)}% to pass`}
        </p>
        {detail && <div className="text-sm text-on-surface-variant">{detail}</div>}
      </div>

      {breakdown}

      {unique.length > 0 && (
        <section aria-labelledby="quiz-missed" className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
          <h3 id="quiz-missed" className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            {missedTitle}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {unique.map((k) => (
              <li key={k.id} className="flex min-w-14 flex-col items-center rounded-xl bg-surface-container-lowest px-3 py-2">
                <span lang="ja" className="font-jp text-2xl font-bold text-on-surface">{k.character}</span>
                <span className="text-xs text-on-surface-variant">{k.romaji}</span>
              </li>
            ))}
          </ul>
          {missedAction && <div className="mt-3">{missedAction}</div>}
        </section>
      )}

      <div className="mt-auto flex w-full flex-col gap-2 sm:mt-0 sm:flex-row sm:justify-center">{actions}</div>
      {children}
    </div>
  )
}
