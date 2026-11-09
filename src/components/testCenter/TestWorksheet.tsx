import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextInput } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { TextButton } from '@/components/ui/TextLink'
import { cn } from '@/lib/cn'
import { shuffle } from '@/lib/pdf/shared'
import { hasJapanese, markTestAnswer } from '@/lib/testCenter/mark'
import type { ChoiceQuestion, SelectQuestion, TestAnswer, TestQuestion, TextQuestion, TilesQuestion } from '@/lib/testCenter/types'
import { QuestionPrompt } from './QuestionPrompt'

interface TestWorksheetProps {
  title: string
  questions: TestQuestion[]
  onExit: () => void
  /** Ask only these questions again. */
  onRetryMissed: (missed: TestQuestion[]) => void
  /** Freshly drawn questions. */
  onAgain: () => void
  doneLabel: string
  /** Fill the blanks by dragging from one shared set of words. */
  wordBank?: boolean
  /** How many questions the learner may ask for, the current size, and how to change it. */
  sizes?: readonly number[]
  count?: number
  onCount?: (count: number) => void
}

interface ControlProps<Q> {
  question: Q
  value: string
  /** Set once the sheet has been checked: the control locks and shows the result. */
  result: TestAnswer | null
  onChange: (given: string) => void
}

function ChoiceControl({ question, value, result, onChange }: ControlProps<ChoiceQuestion>) {
  const long = question.options.some((o) => o.length > 18)
  return (
    <div role="radiogroup" aria-label={question.instruction} className={cn('grid gap-2', long ? 'grid-cols-1' : 'grid-cols-2')}>
      {question.options.map((option) => {
        const chosen = option === value
        const state = !result ? (chosen ? 'chosen' : 'idle') : option === question.answer ? 'right' : chosen ? 'wrong' : 'muted'
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={chosen}
            aria-disabled={result ? true : undefined}
            onClick={() => !result && onChange(option)}
            className={cn(
              'flex min-h-12 items-center justify-center rounded-xl border-2 px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              state === 'idle' && 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60',
              state === 'chosen' && 'border-primary bg-primary/10 text-on-surface',
              state === 'right' && 'border-success bg-success/15 text-on-surface',
              state === 'wrong' && 'border-error bg-error/10 text-on-surface',
              state === 'muted' && 'border-outline-variant/40 text-on-surface opacity-50',
              result && 'cursor-default',
            )}
          >
            <span lang={question.optionsJa ? 'ja' : undefined} className={cn('font-semibold', question.optionsJa ? 'font-jp text-lg' : 'text-sm')}>
              {option}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function SelectControl({ question, value, result, onChange, hints }: ControlProps<SelectQuestion> & { hints: boolean }) {
  const id = useId()
  const slot = result ? (
    <span
      className={cn(
        'mx-1 inline-block rounded-lg border-2 px-2 align-baseline leading-normal',
        result.correct ? 'border-success bg-success/15 text-on-surface' : 'border-error bg-error/10 text-on-surface line-through',
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
        className="min-h-11 cursor-pointer appearance-none rounded-lg border-2 border-primary/60 bg-primary/5 py-0 pl-3 pr-8 font-jp text-[0.85em] font-semibold leading-normal text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
      <Icon name="expand_more" className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-lg text-primary" />
    </span>
  )
  return <QuestionPrompt question={question} slot={slot} compact hints={hints} />
}

function TextControl({ question, value, result, onChange }: ControlProps<TextQuestion>) {
  const id = useId()
  return (
    <>
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
        className={cn(result && (result.correct ? 'ring-2 ring-success' : 'ring-2 ring-error'))}
      />
    </>
  )
}

const TILE = 'min-h-11 rounded-xl border-2 px-3 py-1 font-jp text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/** Reports the sentence only once every tile is placed, so a half-built one doesn't count as answered. */
function TilesControl({ question, result, onChange }: ControlProps<TilesQuestion>) {
  const [order, setOrder] = useState<number[]>([])
  const update = (next: number[]) => {
    setOrder(next)
    onChange(next.length === question.tiles.length ? next.map((tile) => question.tiles[tile]).join('') : '')
  }
  return (
    <>
      <div
        lang="ja"
        aria-label="Your sentence"
        className={cn(
          'flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-2',
          !result && 'border-outline-variant/60',
          result && (result.correct ? 'border-success bg-success/10' : 'border-error bg-error/10'),
        )}
      >
        {order.map((tile, at) => (
          <button
            key={tile}
            type="button"
            aria-label={`Remove ${question.tiles[tile]}`}
            aria-disabled={result ? true : undefined}
            onClick={() => !result && update(order.filter((_, i) => i !== at))}
            className={cn(TILE, 'border-primary/60 bg-primary/5 text-primary')}
          >
            {question.tiles[tile]}
          </button>
        ))}
      </div>
      {!result && (
        <div lang="ja" className="mt-2 flex flex-wrap gap-2">
          {question.tiles.map((word, tile) =>
            order.includes(tile) ? null : (
              <button key={tile} type="button" onClick={() => update([...order, tile])} className={cn(TILE, 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60')}>
                {word}
              </button>
            ),
          )}
        </div>
      )}
    </>
  )
}

function Outcome({ result }: { result: TestAnswer }) {
  const { question, correct } = result
  return (
    <div className="mt-3 flex items-start gap-2 text-sm">
      <Icon name={correct ? 'check_circle' : 'error'} filled className={cn('shrink-0 text-xl', correct ? 'text-success' : 'text-error')} />
      <div className="min-w-0">
        <p className="font-bold text-on-surface">
          {correct ? 'Correct' : result.given ? 'Not quite' : 'Not answered'}
          {(!correct || question.kind === 'text' || question.kind === 'tiles') && (
            <span lang={hasJapanese(question.answer) ? 'ja' : undefined} className={cn('ml-2 font-semibold', hasJapanese(question.answer) && 'font-jp')}>
              {question.answer}
            </span>
          )}
        </p>
        {question.explanation && <p className="mt-0.5 text-on-surface-variant">{question.explanation}</p>}
      </div>
    </div>
  )
}

/** What a word-bank sheet shares: the word being carried, and how to place one. */
interface BankControls {
  picked: string | null
  place: (questionId: string, word: string) => void
  clear: (questionId: string) => void
  pick: (word: string | null) => void
}

const DRAG_TYPE = 'text/plain'

/** A blank in the sentence: drop a word on it, or tap it after tapping a word. Tap a filled one to empty it. */
function DropSlot({ question, value, result, number, bank }: { question: SelectQuestion; value: string; result: TestAnswer | null; number: number; bank: BankControls }) {
  const [over, setOver] = useState(false)
  if (result) {
    return (
      <span className={cn('mx-1 inline-block rounded-lg border-2 px-2 align-baseline leading-normal', result.correct ? 'border-success bg-success/15 text-on-surface' : 'border-error bg-error/10 text-on-surface line-through')}>
        {result.given || '—'}
      </span>
    )
  }
  const tap = () => {
    if (bank.picked) bank.place(question.id, bank.picked)
    else if (value) bank.clear(question.id)
  }
  return (
    <button
      type="button"
      onClick={tap}
      draggable={Boolean(value)}
      onDragStart={(e) => e.dataTransfer.setData(DRAG_TYPE, value)}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const word = e.dataTransfer.getData(DRAG_TYPE)
        if (word) bank.place(question.id, word)
      }}
      aria-label={value ? `Blank ${number}: ${value}. Tap to empty.` : `Blank ${number}: empty`}
      className={cn(
        'mx-1 inline-flex min-h-11 min-w-20 items-center justify-center rounded-lg border-2 px-2 align-middle font-jp text-[0.85em] font-semibold leading-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        value ? 'cursor-grab border-primary/60 bg-primary/5 text-primary' : 'border-dashed border-outline-variant',
        (over || (bank.picked && !value)) && 'border-primary bg-primary/10',
      )}
    >
      {value}
    </button>
  )
}

function WordBank({ words, used, bank }: { words: readonly string[]; used: ReadonlySet<string>; bank: BankControls }) {
  return (
    <div className="sticky top-nav z-10 mb-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low/95 p-3 shadow-elevation-2 backdrop-blur dark:border-outline/60">
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">Drag a word into a blank, or tap a word and then a blank.</p>
      {/* One sideways-scrolling row on phones, so the pinned bank leaves room for the sentences. */}
      <div lang="ja" className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
        {words.map((word) =>
          used.has(word) ? null : (
            <button
              key={word}
              type="button"
              draggable
              aria-pressed={bank.picked === word}
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, word)
                bank.pick(null)
              }}
              onClick={() => bank.pick(bank.picked === word ? null : word)}
              className={cn(TILE, 'shrink-0 cursor-grab', bank.picked === word ? 'border-primary bg-primary/15 text-primary' : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60')}
            >
              {word}
            </button>
          ),
        )}
        {used.size === words.length && <p className="py-2 text-sm text-on-surface-variant">All words placed.</p>}
      </div>
    </div>
  )
}

interface QuestionItemProps {
  id: string
  question: TestQuestion
  number: number
  value: string
  result: TestAnswer | null
  hints: boolean
  bank: BankControls | null
  onChange: (given: string) => void
}

function QuestionItem({ id, question, number, value, result, hints, bank, onChange }: QuestionItemProps) {
  const control = { value, result, onChange }
  return (
    <li id={id} className="scroll-mt-32 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low">
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">
        <span className="tabular-nums text-on-surface">{number}.</span> {question.instruction}
      </p>
      {question.kind === 'select' && bank ? (
        <QuestionPrompt question={question} slot={<DropSlot question={question} value={value} result={result} number={number} bank={bank} />} compact hints={hints} />
      ) : question.kind === 'select' ? (
        <SelectControl question={question} hints={hints} {...control} />
      ) : (
        <>
          <QuestionPrompt question={question} compact hints={hints} />
          <div className="mt-3">
            {question.kind === 'choice' && <ChoiceControl question={question} {...control} />}
            {question.kind === 'text' && <TextControl question={question} {...control} />}
            {question.kind === 'tiles' && <TilesControl question={question} {...control} />}
          </div>
        </>
      )}
      {result && <Outcome result={result} />}
    </li>
  )
}

/** Extra wrong words in the bank, so the last blank isn't a given. */
const BANK_EXTRAS = 3

/**
 * Every question of an exercise on one page: answer them in any order, then
 * check them all at once. Blank answers count as wrong. A side panel jumps to
 * any question and holds the exercise's options. With `wordBank`, the blanks
 * are filled by dragging from one shared set of words. Nothing is saved.
 */
export function TestWorksheet({ title, questions, onExit, onRetryMissed, onAgain, doneLabel, wordBank = false, sizes, count, onCount }: TestWorksheetProps) {
  const [given, setGiven] = useState<Record<string, string>>({})
  const [results, setResults] = useState<TestAnswer[] | null>(null)
  const [hints, setHints] = useState(true)
  const [picked, setPicked] = useState<string | null>(null)
  const score = useRef<HTMLDivElement>(null)
  const idPrefix = useId()
  const answered = questions.filter((q) => given[q.id]?.trim()).length
  const right = results?.filter((r) => r.correct).length ?? 0
  const missed = results?.filter((r) => !r.correct).map((r) => r.question) ?? []
  const hasHints = questions.some((q) => q.translation)
  const dirty = answered > 0 && !results

  const words = useMemo(() => {
    if (!wordBank) return []
    // Only blanks draw from the bank; any other question on the sheet has its own choices.
    const blanks = questions.filter((q) => q.kind === 'select')
    const answers = blanks.map((q) => q.answer)
    const others = [...new Set(blanks.flatMap((q) => q.options))].filter((o) => !answers.includes(o))
    return shuffle([...answers, ...shuffle(others).slice(0, BANK_EXTRAS)])
  }, [questions, wordBank])

  const used = useMemo(() => new Set(Object.values(given).filter((w) => words.includes(w))), [given, words])

  const bank = useMemo<BankControls>(
    () => ({
      picked,
      pick: setPicked,
      place: (questionId, word) => {
        setGiven((g) => {
          // Each word goes in one blank: dropping it here takes it out of any other.
          const next = Object.fromEntries(Object.entries(g).filter(([, w]) => w !== word))
          return { ...next, [questionId]: word }
        })
        setPicked(null)
      },
      clear: (questionId) => setGiven(({ [questionId]: _removed, ...rest }) => rest),
    }),
    [picked],
  )

  // The score is above the fold of a long list: take the learner (and screen readers) there.
  useEffect(() => {
    if (!results) return
    score.current?.focus({ preventScroll: true })
    score.current?.scrollIntoView({ block: 'center' })
  }, [results])

  const check = () => {
    setPicked(null)
    setResults(questions.map((q) => markTestAnswer(q, given[q.id] ?? '')))
  }
  const okToDiscard = (message: string) => !dirty || window.confirm(message)
  const exit = () => okToDiscard('Leave this exercise? Your answers aren’t saved.') && onExit()
  const jump = (i: number) => document.getElementById(`${idPrefix}-${i}`)?.scrollIntoView({ block: 'center' })

  return (
    <PracticeShell wide title={title} progress={questions.length ? answered / questions.length : 0} status={`${answered} / ${questions.length}`} onExit={exit}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div>
          {results && (
            <div ref={score} tabIndex={-1} aria-live="polite" className="mb-4 rounded-2xl bg-surface-container-low p-4 text-center focus:outline-none">
              <p className="font-headline text-4xl font-extrabold tabular-nums text-on-surface">
                {right}
                <span className="text-xl text-on-surface-variant">/{questions.length}</span>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">{missed.length === 0 ? 'All correct.' : `${missed.length} to go over below.`}</p>
            </div>
          )}
          {wordBank && !results && <WordBank words={words} used={used} bank={bank} />}
          <ol className="space-y-3">
            {questions.map((question, i) => (
              <QuestionItem
                key={question.id}
                id={`${idPrefix}-${i}`}
                question={question}
                number={i + 1}
                value={given[question.id] ?? ''}
                result={results?.[i] ?? null}
                hints={hints}
                bank={wordBank ? bank : null}
                onChange={(value) => setGiven((g) => ({ ...g, [question.id]: value }))}
              />
            ))}
          </ol>
        </div>

        <aside aria-label="Exercise options" className="space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low lg:sticky lg:top-nav">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Questions</h2>
            <ul className="mt-2 grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const result = results?.[i]
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-label={`Go to question ${i + 1}`}
                      className={cn(
                        'h-11 w-full rounded-lg border text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        result ? (result.correct ? 'border-success bg-success/15 text-on-surface' : 'border-error bg-error/10 text-on-surface') : given[q.id]?.trim() ? 'border-primary/60 bg-primary/10 text-primary' : 'border-outline-variant/60 text-on-surface-variant hover:border-primary/60',
                      )}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {((sizes && sizes.length > 1 && onCount) || hasHints) && (
            <div className="space-y-2 border-t border-outline-variant/40 pt-3">
              <h2 className="text-sm font-bold text-on-surface">Options</h2>
              {sizes && sizes.length > 1 && onCount && (
                <div role="radiogroup" aria-label="Number of questions" className="flex gap-1 rounded-full bg-surface-container p-1">
                  {sizes.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={count === n}
                      onClick={() => count !== n && okToDiscard(`Start over with ${n} questions? Your answers will be cleared.`) && onCount(n)}
                      className={cn('min-h-11 flex-1 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', count === n ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:text-on-surface')}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              {hasHints && <Switch checked={hints} onChange={setHints} label="Show hints" className="text-sm font-medium text-on-surface" />}
            </div>
          )}

          <div className="space-y-2 border-t border-outline-variant/40 pt-3">
            {!results ? (
              <>
                <Button onClick={check} disabled={answered === 0} className="flex w-full items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-50">
                  Check answers
                </Button>
                {answered > 0 && answered < questions.length && <p className="text-center text-xs text-on-surface-variant">{questions.length - answered} left blank will count as wrong.</p>}
              </>
            ) : (
              missed.length > 0 && (
                <Button onClick={() => onRetryMissed(missed)} className="flex w-full items-center justify-center gap-2">
                  <Icon name="replay" className="text-lg" />
                  Retry the {missed.length} missed
                </Button>
              )
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-5">
              <TextButton onClick={() => okToDiscard('Get new questions? Your answers will be cleared.') && onAgain()} leadingIcon="refresh" tone="neutral" className="min-h-11">
                New questions
              </TextButton>
              {results && (
                <TextButton onClick={onExit} leadingIcon="tune" tone="neutral" className="min-h-11">
                  {doneLabel}
                </TextButton>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PracticeShell>
  )
}
