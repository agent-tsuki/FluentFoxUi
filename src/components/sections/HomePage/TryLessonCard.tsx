import { memo, useCallback, useEffect, useReducer, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { useStartLearning } from '@/hooks/useStartLearning'
import { TRY_LESSON, type LessonCard } from '@/lib/content/home/hero'

/* ── State machine: 0 = す card · 1 = し card · 2 = read すし · 3 = done ── */

type Step = 0 | 1 | 2 | 3
const STEPS: readonly Step[] = [0, 1, 2, 3]

interface LessonState {
  step: Step
  wrongPick: string | null
}

type LessonAction = { type: 'next' } | { type: 'pick'; option: string } | { type: 'restart' }

const INITIAL_STATE: LessonState = { step: 0, wrongPick: null }

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'next':
      return state.step < 2 ? { step: (state.step + 1) as Step, wrongPick: null } : state
    case 'pick':
      return action.option === TRY_LESSON.quiz.answer
        ? { step: 3, wrongPick: null }
        : { ...state, wrongPick: action.option }
    case 'restart':
      return INITIAL_STATE
  }
}

const labelClass = 'text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant'
const bigButtonClass = 'mt-auto w-full min-h-[3.25rem] text-[1.0625rem]'

/** Progress dots in the dark header: done/current = accent, current = wide pill. */
const ProgressDots = memo(function ProgressDots({ step }: { step: Step }) {
  return (
    <div aria-hidden="true" className="flex gap-1.5">
      {STEPS.map((i) => (
        <span
          key={i}
          className={cn(
            'block h-2 rounded-full transition-[width] duration-200',
            i === step ? 'w-[1.375rem]' : 'w-2',
            i <= step ? 'bg-primary' : 'bg-on-surface-inverse/25'
          )}
        />
      ))}
    </div>
  )
})

function LearnStep({ card, onNext }: { card: LessonCard; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
      <span className={labelClass}>{card.label}</span>
      <span lang="ja" className="font-jp text-[8.25rem] font-bold leading-[1.05] text-primary">
        {card.kana}
      </span>
      <span className="text-3xl font-extrabold tracking-[-0.02em] text-on-surface">{card.romaji}</span>
      <p className="max-w-[30ch] text-base leading-normal text-on-surface-variant">{card.tip}</p>
      <Button type="button" onClick={onNext} className={bigButtonClass}>
        {card.cta}
      </Button>
    </div>
  )
}

function QuizStep({ wrongPick, onPick }: { wrongPick: string | null; onPick: (option: string) => void }) {
  const { quiz, cards } = TRY_LESSON
  return (
    <div className="flex flex-1 flex-col items-center gap-3.5 text-center">
      <span className={labelClass}>{quiz.label}</span>
      <span
        lang="ja"
        className="font-jp text-[6.5rem] font-bold leading-[1.1] tracking-[0.04em] text-on-surface"
      >
        {quiz.word}
      </span>
      <div role="group" aria-label={quiz.groupLabel} className="grid w-full grid-cols-3 gap-2.5">
        {quiz.options.map((option) => {
          const isWrong = wrongPick === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPick(option)}
              className={cn(
                'min-h-[3.25rem] min-w-0 rounded-xl border-[1.5px] px-2.5 text-[1.0625rem] font-bold text-on-surface transition-colors duration-150',
                isWrong
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      {/* Always mounted so screen readers announce the hint when it appears. */}
      <p role="status" className="text-[0.9375rem] font-semibold text-on-surface">
        {wrongPick !== null && (
          <>
            {quiz.hintLead}{' '}
            {cards.map((c, i) => (
              <span key={c.kana}>
                {i > 0 && ' + '}
                <span lang="ja" className="font-jp">{c.kana}</span> ({c.romaji})
              </span>
            ))}
            .
          </>
        )}
      </p>
    </div>
  )
}

function DoneStep({ onRestart }: { onRestart: () => void }) {
  const { done } = TRY_LESSON
  const { startLearning, prefetch } = useStartLearning()
  const percent = (done.learned / done.total) * 100

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-[3.25rem] flex-none items-center justify-center rounded-full bg-success/15"
        >
          <Icon name="check" className="text-[1.625rem] font-bold text-success" />
        </span>
        <div>
          <p className="text-[1.375rem] font-extrabold tracking-[-0.02em] text-on-surface">{done.title}</p>
          <p className="mt-0.5 text-[0.9375rem] text-on-surface-variant">
            <span lang="ja" className="font-jp">{done.word}</span> = {done.meaning}
            {done.rest}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl bg-surface-container-low px-[1.125rem] py-4">
        <div className="flex justify-between text-sm font-bold text-on-surface">
          <span>{done.progressLabel}</span>
          <span className="text-primary">
            {done.learned} {done.progressOf} {done.total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={done.progressLabel}
          aria-valuemin={0}
          aria-valuemax={done.total}
          aria-valuenow={done.learned}
          className="h-2.5 overflow-hidden rounded-full bg-outline-variant/60"
        >
          <div className="h-full min-w-[0.875rem] rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-on-surface-variant">
          {done.nextBefore}
          <span lang="ja" className="font-jp">{done.nextKana}</span>
          {done.nextAfter}
        </p>
      </div>

      <Button type="button" onClick={startLearning} {...prefetch} className={bigButtonClass}>
        {done.cta}
      </Button>
      <button
        type="button"
        onClick={onRestart}
        className="min-h-11 self-center px-3 text-[0.9375rem] font-semibold text-on-surface-variant underline underline-offset-2 hover:text-on-surface"
      >
        {done.restart}
      </button>
    </div>
  )
}

/**
 * Homepage "Try it · 60-second lesson" widget: learn す and し, read すし,
 * then a nudge to sign up. Pure client state — no data fetching.
 */
export function TryLessonCard() {
  const [state, dispatch] = useReducer(lessonReducer, INITIAL_STATE)
  const bodyRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const pick = useCallback((option: string) => dispatch({ type: 'pick', option }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])

  // The button that advanced the step unmounts — keep keyboard focus inside the card.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    bodyRef.current?.focus({ preventScroll: true })
  }, [state.step])

  return (
    <div className="flex min-w-0 shrink grow basis-[400px] justify-center">
      <div className="w-full max-w-[440px] overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-elevation-3">
        <div className="flex items-center justify-between gap-3 bg-surface-inverse px-5 py-3.5 text-on-surface-inverse">
          <span className="text-sm font-bold">{TRY_LESSON.title}</span>
          <ProgressDots step={state.step} />
        </div>
        <div
          ref={bodyRef}
          tabIndex={-1}
          className="flex min-h-[360px] flex-col px-7 pb-7 pt-8 outline-none"
        >
          {state.step < 2 && <LearnStep card={TRY_LESSON.cards[state.step === 0 ? 0 : 1]} onNext={next} />}
          {state.step === 2 && <QuizStep wrongPick={state.wrongPick} onPick={pick} />}
          {state.step === 3 && <DoneStep onRestart={restart} />}
        </div>
      </div>
    </div>
  )
}
