import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import { formatDuration } from './useQuizTimer'

interface FinalTestIntroProps {
  questionCount: number
  limitSeconds: number
  /** Best score so far, 0–1, or undefined if never taken. */
  best: number | undefined
  speech: boolean
  onStart: () => void
}

/** What the final test covers, the rules, the best score, and Start. */
export function FinalTestIntro({ questionCount, limitSeconds, best, speech, onStart }: FinalTestIntroProps) {
  const script = useKanaScript()
  const lower = script.label.toLowerCase()
  const passMark = script.finalTest.passMark
  const rules = [
    { icon: 'school', text: `All ${questionCount} ${lower} (${script.finalTest.covers}), each once, in random order.` },
    { icon: 'quiz', text: speech ? 'Mixed questions: read the kana, find the kana, or pick the one you hear.' : 'Mixed questions: read the kana or find the kana.' },
    { icon: 'timer', text: `About ${Math.round(limitSeconds / 60)} minutes (${formatDuration(limitSeconds)}). The clock pauses if you leave the tab; questions left when it runs out count as wrong.` },
    { icon: 'check_circle', text: `Pass mark ${Math.round(passMark * 100)}%.` },
  ]
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <Icon name="emoji_events" className="text-5xl text-primary" />
        <h1 className="font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">{script.label} final test</h1>
        <p className="text-sm font-semibold tabular-nums text-on-surface">
          All {questionCount} {lower} · {Math.round(limitSeconds / 60)} min · {Math.round(passMark * 100)} % to pass
        </p>
        <p className="text-on-surface-variant">
          {best === undefined ? 'No attempt yet.' : `Best score so far: ${Math.round(best * 100)}%`}
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
