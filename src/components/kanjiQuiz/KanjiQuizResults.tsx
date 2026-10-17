import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { KanjiEntry } from '@/types/kanji'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { kanjiCharPath } from '@/lib/content/kanji/levels'
import type { KanjiAnswer } from './types'

interface KanjiQuizResultsProps {
  answers: KanjiAnswer[]
  /** 0–1. Omit for practice / reviews (no pass or fail). */
  passMark?: number
  detail?: ReactNode
  breakdown?: ReactNode
  missedTitle?: string
  actions: ReactNode
  children?: ReactNode
}

/**
 * Score, pass/fail (when there is a pass mark), the kanji to revisit (each a
 * link to its kanji page), then the next steps. Same layout as the kana QuizResults.
 */
export function KanjiQuizResults({ answers, passMark, detail, breakdown, missedTitle = 'Kanji to revisit', actions, children }: KanjiQuizResultsProps) {
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const passed = passMark === undefined ? undefined : correct / Math.max(1, total) >= passMark
  const missed = [...new Map(answers.filter((a) => !a.correct).map((a) => [a.question.target.char, a.question.target])).values()]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div role="status" className="flex flex-col items-center gap-3 pt-4 text-center">
        <Icon name={passed === false ? 'school' : 'emoji_events'} className={cn('text-5xl', passed === false ? 'text-on-surface-variant' : 'text-primary')} />
        <p className="font-headline text-5xl font-extrabold tabular-nums text-on-surface">{pct}%</p>
        <p className="text-on-surface-variant">
          {correct} of {total} correct
        </p>
        {passed !== undefined && passMark !== undefined && (
          <p className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold', passed ? 'bg-success/15 text-success' : 'bg-surface-container-high text-on-surface')}>
            <Icon name={passed ? 'check_circle' : 'refresh'} filled={passed} className="text-lg" />
            {passed ? 'Passed' : `Not yet — ${Math.round(passMark * 100)}% to pass`}
          </p>
        )}
        {detail && <div className="text-sm text-on-surface-variant">{detail}</div>}
      </div>

      {breakdown}

      {missed.length > 0 && <MissedKanji kanji={missed} title={missedTitle} />}

      <div className="mt-auto flex w-full flex-col gap-2 sm:mt-0 sm:flex-row sm:justify-center">{actions}</div>
      {children}
    </div>
  )
}

function MissedKanji({ kanji, title }: { kanji: KanjiEntry[]; title: string }) {
  return (
    <section aria-labelledby="quiz-missed" className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
      <h3 id="quiz-missed" className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {kanji.map((k) => (
          <li key={k.char}>
            <Link
              to={kanjiCharPath(k.char, k.jlpt)}
              className="flex min-w-16 flex-col items-center rounded-xl bg-surface-container-lowest px-3 py-2 hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span lang="ja" className="font-jp text-3xl font-bold text-on-surface">
                {k.char}
              </span>
              <span className="max-w-24 truncate text-xs text-on-surface-variant">{k.meanings[0]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
