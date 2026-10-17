import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import {
  GRADE_LABELS,
  GRADE_LABEL_TEXT,
  GRADE_REASON_TEXT,
  buildResultView,
  formatNextDue,
  formatSeconds,
  type ResultRow,
} from '@/lib/learn/sessionResult'
import { HOW_GRADING_WORKS_PATH } from '@/lib/learn/paths'
import type { AnswerResultItem, GradeLabel, SessionResult } from '@/types/learn'

const LABEL_TONE: Record<GradeLabel, string> = {
  strong: 'bg-success/15 text-success',
  good: 'bg-primary/10 text-primary',
  shaky: 'bg-tertiary/10 text-tertiary',
  missed: 'bg-error-container text-on-error-container',
}

interface SessionResultViewProps {
  result: SessionResult
  answersByCard: ReadonlyMap<string, readonly AnswerResultItem[]>
  /** Buttons under the list (e.g. Done, Review more). */
  actions: ReactNode
}

/**
 * The end of a session: how many cards were Strong / Good / Shaky / Missed,
 * then one row per card with its grade, time against your usual time and
 * when it comes back. Tapping a row explains the grade.
 */
export function SessionResultView({ result, answersByCard, actions }: SessionResultViewProps) {
  const view = useMemo(() => buildResultView(result, answersByCard), [result, answersByCard])
  return (
    <div className="flex flex-1 flex-col gap-6" role="status">
      <div className="text-center">
        <Icon name="celebration" className="text-5xl text-primary" />
        <p className="mt-2 font-headline text-2xl font-extrabold text-on-surface">Session complete</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          {result.correct_count} of {result.answer_count} answers right
          {result.test && ` · score ${result.test.score} / ${result.test.total}${result.test.passed ? ', passed' : ''}`}
        </p>
      </div>
      <ul className="grid grid-cols-4 gap-2" aria-label="Grades">
        {GRADE_LABELS.map((label) => (
          <li key={label} className={cn('flex flex-col items-center rounded-2xl px-1 py-3', LABEL_TONE[label])}>
            <span className="font-headline text-2xl font-extrabold tabular-nums">{view.counts[label]}</span>
            <span className="text-xs font-bold">{GRADE_LABEL_TEXT[label]}</span>
          </li>
        ))}
      </ul>
      {view.rows.length > 0 && (
        <ul className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/60" aria-label="Cards">
          {view.rows.map((row) => (
            <ResultRowItem key={row.card_id} row={row} />
          ))}
        </ul>
      )}
      <Link to={HOW_GRADING_WORKS_PATH} className="self-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
        How grading works
      </Link>
      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-center">{actions}</div>
    </div>
  )
}

const FACET_TEXT: Record<ResultRow['facet'], string> = {
  recognition: 'reading',
  meaning: 'meaning',
  reading: 'reading',
  writing: 'writing',
}

function ResultRowItem({ row }: { row: ResultRow }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <span lang="ja" className="w-12 shrink-0 text-center font-jp text-2xl font-bold text-on-surface">
          {row.char}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-on-surface">
            {row.item_type === 'kanji' ? FACET_TEXT[row.facet] : 'kana'}
            {row.activeMs !== null && (
              <span className="text-on-surface-variant">
                {' · '}
                {formatSeconds(row.activeMs)}
                {row.usualMs !== null && ` (usual ${formatSeconds(row.usualMs)})`}
              </span>
            )}
          </span>
          <span className="block text-xs text-on-surface-variant">Next review {formatNextDue(row.next_due)}</span>
        </span>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-bold', LABEL_TONE[row.label])}>{GRADE_LABEL_TEXT[row.label]}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} className="shrink-0 text-xl text-on-surface-variant" />
      </button>
      {open && <p className="px-4 pb-3 pl-[4.75rem] text-sm text-on-surface-variant">{GRADE_REASON_TEXT[row.reason]}</p>}
    </li>
  )
}
