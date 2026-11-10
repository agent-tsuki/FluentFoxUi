import type { ReactNode } from 'react'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextButton } from '@/components/ui/TextLink'
import { cn } from '@/lib/cn'
import { hasJapanese } from '@/lib/testCenter/mark'
import { formatDef } from '@/lib/testCenter/subjects'
import type { TestAnswer, TestPrompt } from '@/lib/testCenter/types'

interface TestResultsProps {
  title: string
  answers: TestAnswer[]
  /** Ask only the questions answered wrong, again (practice only; absent for graded quizzes). */
  onRetryMissed?: () => void
  /** Same choices, freshly drawn questions. */
  onAgain: () => void
  /** Back to the setup page. */
  onDone: () => void
  againLabel?: string
  doneLabel?: string
  /** Shown in place of the encouragement line, e.g. the server's pass or fail. */
  status?: ReactNode
}

function promptText(prompt: TestPrompt): string {
  if (prompt.type === 'gap' || prompt.type === 'picture') return `${prompt.before}＿＿${prompt.after}`
  if (prompt.type === 'exchange') return `${prompt.lines.join(' ')} → ${prompt.statement}`
  return prompt.text
}

function verdict(ratio: number): string {
  if (ratio === 1) return 'Perfect score.'
  if (ratio >= 0.8) return 'Strong work. Go over the few you missed.'
  if (ratio >= 0.5) return 'Getting there. Retry the ones you missed.'
  return 'Worth another look. Retry the ones you missed, then run it again.'
}

/** A practice test's result: the score, and each missed question with the right answer and why. */
export function TestResults({
  title,
  answers,
  onRetryMissed,
  onAgain,
  onDone,
  againLabel = 'New questions, same test',
  doneLabel = 'Change test',
  status,
}: TestResultsProps) {
  const right = answers.filter((a) => a.correct).length
  const total = answers.length
  const ratio = total ? right / total : 0
  const missed = answers.filter((a) => !a.correct)

  return (
    <PracticeShell title={title} progress={1} onExit={onDone}>
      <div className="pt-8 sm:pt-12">
        <div className="text-center">
          <p className="font-display text-6xl font-extrabold tabular-nums text-ink">
            {right}
            <span className="text-3xl text-ink-muted">/{total}</span>
          </p>
          <p className={cn('mt-2 text-lg font-bold', ratio >= 0.8 ? 'text-success' : 'text-ink')}>{Math.round(ratio * 100)}%</p>
          {status ?? <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{verdict(ratio)}</p>}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {missed.length > 0 && onRetryMissed && (
            <Button onClick={onRetryMissed} className="flex w-full max-w-xs items-center justify-center gap-2">
              <Icon name="replay" className="text-lg" />
              Retry the {missed.length} missed
            </Button>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <TextButton onClick={onAgain} leadingIcon="refresh" tone={missed.length ? 'neutral' : 'primary'} className="min-h-11">
              {againLabel}
            </TextButton>
            <TextButton onClick={onDone} leadingIcon="tune" tone="neutral" className="min-h-11">
              {doneLabel}
            </TextButton>
          </div>
        </div>

        {missed.length > 0 && (
          <section aria-labelledby="missed-title" className="mt-10">
            <h2 id="missed-title" className="mb-3 font-display text-lg font-bold text-ink">
              To go over
            </h2>
            <ul className="space-y-3">
              {missed.map(({ question, given }) => {
                const prompt = promptText(question.prompt)
                return (
                  <li
                    key={question.id}
                    className="rounded-xl border border-line bg-surface-raised p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {question.label ?? formatDef(question.format).title}
                    </p>
                    <p
                      lang={hasJapanese(prompt) ? 'ja' : undefined}
                      className={cn('mt-1 text-lg font-semibold text-ink', hasJapanese(prompt) && 'font-ja')}
                    >
                      {prompt}
                    </p>
                    {question.translation && <p className="text-sm text-ink-muted">{question.translation}</p>}
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-ink-muted">You</dt>
                      <dd lang={hasJapanese(given) ? 'ja' : undefined} className="text-error line-through decoration-error/60">
                        {given || '—'}
                      </dd>
                      <dt className="text-ink-muted">Answer</dt>
                      <dd lang={hasJapanese(question.answer) ? 'ja' : undefined} className="font-semibold text-success">
                        {question.answer}
                      </dd>
                    </dl>
                    {question.explanation && <p className="mt-2 text-sm text-ink-muted">{question.explanation}</p>}
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </PracticeShell>
  )
}
