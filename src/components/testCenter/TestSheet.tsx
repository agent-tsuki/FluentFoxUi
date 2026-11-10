import { useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { AnswerOption } from '@/components/ui/AnswerOption'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextInput } from '@/components/ui/FormField'
import type { AnswerBuilder } from '@/hooks/useStudyRecorder'
import { cn } from '@/lib/cn'
import { AnswerTimer } from '@/lib/learn/answerTimer'
import { hasJapanese, markTestAnswer } from '@/lib/testCenter/mark'
import type { ChoiceQuestion, SelectQuestion, TestAnswer, TestQuestion, TextQuestion, TilesQuestion } from '@/lib/testCenter/types'
import { QuestionPrompt as Prompt } from './QuestionPrompt'

interface TestSheetProps {
  title: string
  questions: TestQuestion[]
  /** Each answered question, once the sheet is checked, with its timing (graded quizzes send it to the server). */
  onAnswer?: (question: TestQuestion, given: string, timer: AnswerBuilder) => void
  /** After every answer has been passed to `onAnswer`. */
  onCheck: (answers: TestAnswer[]) => void
  onExit: () => void
  onAgain: () => void
  againLabel?: string
  doneLabel?: string
  /** Shown under the score once checked, e.g. the server's pass or fail. */
  status?: ReactNode
}

interface ControlProps<Q> {
  question: Q
  value: string
  /** Set once the sheet is checked: the control locks and shows the result. */
  result: TestAnswer | null
  onChange: (given: string) => void
}

/**
 * TestSheet: every question of a test on one page. The learner answers in any
 * order and can change any answer, then checks the whole sheet at once; each
 * question then shows right or wrong, the answer and why, and the score sits at the top.
 */
export function TestSheet({ title, questions, onAnswer, onCheck, onExit, onAgain, againLabel = 'Try again', doneLabel = 'Done', status }: TestSheetProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [results, setResults] = useState<TestAnswer[] | null>(null)
  const [confirming, setConfirming] = useState(false)
  const top = useRef<HTMLDivElement>(null)
  // One timer per question, all started when the sheet opens.
  const timers = useMemo(() => new Map(questions.map((q) => [q.id, new AnswerTimer()])), [questions])
  const byId = useMemo(() => new Map(results?.map((r) => [r.question.id, r])), [results])

  const answered = questions.filter((q) => values[q.id]?.trim()).length
  const blank = questions.length - answered
  const correct = results?.filter((r) => r.correct).length ?? 0

  const change = (question: TestQuestion, given: string) => {
    if (results) return
    timers.get(question.id)?.markInput()
    setValues((v) => ({ ...v, [question.id]: given }))
    setConfirming(false)
  }

  const check = () => {
    if (blank > 0 && !confirming) {
      setConfirming(true)
      return
    }
    const all = questions.map((question) => {
      const given = values[question.id]?.trim() ?? ''
      const timer = timers.get(question.id)
      if (given && timer) {
        timer.attempt()
        onAnswer?.(question, given, { buildAnswer: (details) => timer.build(details) })
      }
      return given ? markTestAnswer(question, given) : { question, given, correct: false }
    })
    setResults(all)
    setConfirming(false)
    onCheck(all)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const firstBlank = () => {
    const q = questions.find((item) => !values[item.id]?.trim())
    if (q) document.getElementById(`sheet-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const actions = results && (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <Button size="lg" onClick={onAgain}>
        {againLabel}
        <Icon name="refresh" className="text-xl" />
      </Button>
      <Button size="lg" variant="secondary" onClick={onExit}>
        {doneLabel}
      </Button>
    </div>
  )

  return (
    <PracticeShell
      title={title}
      progress={results ? 1 : answered / questions.length}
      status={results ? `${correct} / ${questions.length}` : `${answered} / ${questions.length}`}
      onExit={onExit}
    >
      <div ref={top} className="scroll-mt-nav">
        {results ? (
          <section aria-live="polite" className="rounded-lg bg-surface-raised p-5 text-center shadow-elevation-1 sm:p-6">
            <p className="font-display text-h2 font-bold text-ink">
              {correct} of {questions.length} correct
            </p>
            {status}
            <div className="mt-5">{actions}</div>
          </section>
        ) : (
          <p className="text-body text-ink-muted">Answer each question, in any order. You can change an answer until you check the sheet.</p>
        )}
      </div>

      <ol className="mt-6 grid gap-4">
        {questions.map((question, i) => {
          const result = byId.get(question.id) ?? null
          const value = values[question.id] ?? ''
          return (
            <li
              key={question.id}
              id={`sheet-${question.id}`}
              className={cn(
                'scroll-mt-nav rounded-lg bg-surface-raised p-4 shadow-elevation-1 sm:p-5',
                result && (result.correct ? 'ring-2 ring-success' : 'ring-2 ring-danger'),
              )}
            >
              <div className="mb-3 flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-caption font-bold',
                    value.trim() && !result ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-ink-muted',
                  )}
                >
                  {i + 1}
                </span>
                <p className="pt-0.5 text-label font-medium text-ink-muted">
                  <span className="sr-only">Question {i + 1}: </span>
                  {question.instruction}
                </p>
              </div>
              {question.kind === 'choice' && <ChoiceControl question={question} value={value} result={result} onChange={(g) => change(question, g)} />}
              {question.kind === 'select' && <SelectControl question={question} value={value} result={result} onChange={(g) => change(question, g)} />}
              {question.kind === 'text' && <TextControl question={question} value={value} result={result} onChange={(g) => change(question, g)} />}
              {question.kind === 'tiles' && <TilesControl question={question} value={value} result={result} onChange={(g) => change(question, g)} />}
              {result && <Verdict result={result} />}
            </li>
          )
        })}
      </ol>

      <div className="mt-6 grid gap-3">
        {results ? (
          actions
        ) : (
          <>
            {confirming && (
              <div role="alert" className="rounded-lg bg-warning-soft p-4 text-body text-warning-ink">
                {blank === 1 ? '1 question is' : `${blank} questions are`} still blank and will count as wrong.
                <button type="button" onClick={firstBlank} className="ml-1 font-semibold underline underline-offset-2">
                  Go to the first one
                </button>
              </div>
            )}
            <Button size="lg" onClick={check} disabled={answered === 0} className="flex w-full">
              {confirming ? 'Check anyway' : 'Check answers'}
              <Icon name="check" className="text-xl" />
            </Button>
          </>
        )}
      </div>
    </PracticeShell>
  )
}

// ─── Controls ────────────────────────────────────────────────────────────────

function ChoiceControl({ question, value, result, onChange }: ControlProps<ChoiceQuestion>) {
  return (
    <>
      <Prompt question={question} compact />
      <ul role="group" aria-label={question.instruction} className="mt-3 grid gap-2">
        {question.options.map((option, i) => (
          <li key={option}>
            <AnswerOption
              index={i}
              label={option}
              ja={question.optionsJa}
              state={!result ? (option === value ? 'selected' : 'idle') : option === question.answer ? 'correct' : option === result.given ? 'wrong' : 'muted'}
              onSelect={() => onChange(option)}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

function SelectControl({ question, value, result, onChange }: ControlProps<SelectQuestion>) {
  const id = useId()
  const slot = result ? (
    <span
      className={cn(
        'mx-1 inline-block rounded-sm border-2 px-2 align-baseline leading-normal',
        result.correct ? 'border-success bg-success-soft text-success-ink' : 'border-danger bg-danger-soft text-danger-ink line-through',
      )}
    >
      {result.given || '—'}
    </span>
  ) : (
    <span className="relative mx-1 inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        Missing word
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-sm border-2 border-primary/60 bg-primary-soft py-0 pl-3 pr-8 font-ja text-[0.85em] font-semibold leading-normal text-primary-ink focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="" disabled>
          ？
        </option>
        {question.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="expand_more" className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-lg text-primary-ink" />
    </span>
  )
  return <Prompt question={question} slot={slot} compact />
}

function TextControl({ question, value, result, onChange }: ControlProps<TextQuestion>) {
  const id = useId()
  return (
    <>
      <Prompt question={question} compact />
      <label htmlFor={id} className="sr-only">
        Your answer
      </label>
      <TextInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={Boolean(result)}
        placeholder={question.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn('mt-3 max-w-sm text-lg', result && (result.correct ? 'ring-2 ring-success' : 'ring-2 ring-danger'))}
      />
    </>
  )
}

const TILE = 'min-h-11 rounded-md border-2 px-3 py-1.5 font-ja text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function TilesControl({ question, result, onChange }: ControlProps<TilesQuestion>) {
  /** Positions in `question.tiles`, in the order tapped (the same word can appear twice). */
  const [order, setOrder] = useState<number[]>([])
  const update = (next: number[]) => {
    setOrder(next)
    // Only a finished sentence counts as an answer.
    onChange(next.length === question.tiles.length ? next.map((t) => question.tiles[t]).join('') : '')
  }
  return (
    <>
      <Prompt question={question} compact />
      <div
        lang="ja"
        aria-label="Your sentence"
        className={cn(
          'mt-3 flex min-h-14 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed p-2',
          !result && 'border-line',
          result && (result.correct ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft'),
        )}
      >
        {order.map((tile, at) => (
          <button
            key={tile}
            type="button"
            aria-label={`Remove ${question.tiles[tile]}`}
            aria-disabled={result ? true : undefined}
            onClick={() => !result && update(order.filter((_, i) => i !== at))}
            className={cn(TILE, 'border-primary/60 bg-primary-soft text-primary-ink')}
          >
            {question.tiles[tile]}
          </button>
        ))}
      </div>
      {!result && (
        <div lang="ja" className="mt-3 flex flex-wrap gap-2">
          {question.tiles.map((word, tile) =>
            order.includes(tile) ? null : (
              <button key={tile} type="button" onClick={() => update([...order, tile])} className={cn(TILE, 'border-line bg-surface-raised text-ink hover:border-primary/60')}>
                {word}
              </button>
            ),
          )}
        </div>
      )}
    </>
  )
}

// ─── After checking ──────────────────────────────────────────────────────────

function Verdict({ result }: { result: TestAnswer }) {
  const { question } = result
  const showAnswer = !result.correct || question.kind === 'text' || question.kind === 'tiles'
  return (
    <div className={cn('mt-4 flex items-start gap-3 rounded-md p-3 text-sm', result.correct ? 'bg-success-soft' : 'bg-danger-soft')}>
      <Icon name={result.correct ? 'check_circle' : 'error'} filled className={cn('mt-0.5 shrink-0 text-xl', result.correct ? 'text-success' : 'text-danger')} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink">{result.correct ? 'Correct' : result.given ? 'Not quite' : 'Not answered'}</p>
        {showAnswer && (
          <p className="mt-0.5 text-ink">
            Answer:{' '}
            <span lang={hasJapanese(question.answer) ? 'ja' : undefined} className={cn('font-semibold', hasJapanese(question.answer) && 'font-ja')}>
              {question.answer}
            </span>
          </p>
        )}
        {question.explanation && <p className="mt-1 text-ink-muted">{question.explanation}</p>}
      </div>
    </div>
  )
}
