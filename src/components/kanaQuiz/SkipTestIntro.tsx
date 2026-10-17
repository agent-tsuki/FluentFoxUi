import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { KanaSkipTestDef } from '@/lib/content/kana/scripts'

interface SkipTestIntroProps {
  /** The test's title, scope and description, from the script config. */
  test: KanaSkipTestDef
  questionCount: number
  unitCount: number
  /** Best score so far, 0–1, or undefined if never taken. */
  best: number | undefined
  speech: boolean
  onStart: () => void
}

/** What a skip ("test out") test covers, how skipping works, the best score, and Start. */
export function SkipTestIntro({ test, questionCount, unitCount, best, speech, onStart }: SkipTestIntroProps) {
  const script = useKanaScript()
  const scope = test.scope
  const mark = Math.round(script.skipPassMark * 100)
  const rules = [
    { icon: 'school', text: test.covers },
    {
      icon: 'quiz',
      text: `${questionCount} questions across ${unitCount} unit${unitCount === 1 ? '' : 's'}. ${
        speech ? 'Read the kana, find the kana, or pick the one you hear.' : 'Read the kana or find the kana.'
      }`,
    },
    { icon: 'check_circle', text: `Score ${mark}% on a unit and it's marked Tested out. Units you miss stay open for you to learn.` },
    ...(scope === 'all'
      ? [{ icon: 'workspace_premium', text: `Score ${Math.round(script.finalTest.passMark * 100)}% overall to pass the final test and unlock your certificate.` }]
      : []),
    { icon: 'schedule', text: 'No timer. Take your time.' },
  ]
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <Icon name="school" className="text-5xl text-primary" />
        <h1 className="font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">{test.title}</h1>
        <p className="text-on-surface-variant">
          {best === undefined ? 'Already know these? Prove it and skip ahead.' : `Best score so far: ${Math.round(best * 100)}%`}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {rules.map((r) => (
          <li key={r.icon} className="flex items-start gap-3 text-on-surface">
            <Icon name={r.icon} className="mt-0.5 text-xl text-primary" />
            <span className="leading-relaxed">{r.text}</span>
          </li>
        ))}
      </ul>
      {speech && (
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Icon name="volume_up" className="text-lg" /> Turn your sound on for the listening questions.
        </p>
      )}
      <Button onClick={onStart} className="mt-auto flex min-h-14 w-full items-center justify-center gap-2 sm:mt-0">
        {best === undefined ? 'Start the test' : 'Take the test again'}
        <Icon name="arrow_forward" className="text-xl" />
      </Button>
    </div>
  )
}
