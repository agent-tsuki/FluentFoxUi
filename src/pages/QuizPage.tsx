import { useCallback, useEffect, useState } from 'react'
import { TestSetupView } from '@/components/testCenter/TestSetupView'
import { TestRunner } from '@/components/testCenter/TestRunner'
import { TestResults } from '@/components/testCenter/TestResults'
import { subjectDef } from '@/lib/testCenter/subjects'
import type { TestSource } from '@/lib/testCenter/sources'
import type { TestAnswer, TestQuestion, TestSetup } from '@/lib/testCenter/types'

type Run =
  | { phase: 'setup' }
  | {
      phase: 'testing'
      setup: TestSetup
      source: TestSource
      questions: TestQuestion[]
      attempt: number
    }
  | {
      phase: 'results'
      setup: TestSetup
      source: TestSource
      questions: TestQuestion[]
      answers: TestAnswer[]
      attempt: number
    }

/**
 * Practice tests: set one up (subject, level, what to cover, question types,
 * length), take it, see what you missed and retry. Ungraded and kept on this
 * page only.
 */
export function QuizPage() {
  const [run, setRun] = useState<Run>({ phase: 'setup' })

  // Each screen starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [run.phase])

  const start = useCallback((setup: TestSetup, questions: TestQuestion[], source: TestSource) => {
    setRun({ phase: 'testing', setup, source, questions, attempt: 0 })
  }, [])

  if (run.phase === 'setup') return <TestSetupView onStart={start} />

  const subject = subjectDef(run.setup.subject)
  const title = `${subject.title} test`

  if (run.phase === 'testing') {
    return (
      <main className="min-h-dvh bg-surface pt-nav">
        <TestRunner
          // A retry is a new run: fresh state even with the same questions.
          key={run.attempt}
          title={title}
          questions={run.questions}
          onExit={() => setRun({ phase: 'setup' })}
          onFinish={(answers) => setRun({ ...run, phase: 'results', answers })}
        />
      </main>
    )
  }

  const { setup, source, attempt } = run
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      <TestResults
        title={title}
        answers={run.answers}
        onRetryMissed={() =>
          setRun({
            phase: 'testing',
            setup,
            source,
            attempt: attempt + 1,
            questions: run.answers.filter((a) => !a.correct).map((a) => a.question),
          })
        }
        onAgain={() =>
          setRun({
            phase: 'testing',
            setup,
            source,
            attempt: attempt + 1,
            questions: source.build(setup.scope, setup.formats, setup.count),
          })
        }
        onDone={() => setRun({ phase: 'setup' })}
      />
    </main>
  )
}
