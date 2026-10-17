import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from './ActionLink'

interface UnitQuizPanelProps {
  unit: KanaUnit
}

const pct = (score: number) => `${Math.round(score * 100)}%`

/** Quiz step body: best score vs. the pass mark, and the link to the unit quiz. */
export function UnitQuizPanel({ unit }: UnitQuizPanelProps) {
  const script = useKanaScript()
  const progress = useLearningPath().units[unit.id]
  const best = progress?.quizBest
  const passed = Boolean(progress?.quizPassedAt)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <dl className="flex gap-8 text-sm">
        <div>
          <dt className="text-on-surface-variant">Best score</dt>
          <dd className="mt-0.5 font-headline text-lg font-bold text-on-surface">
            {best !== undefined ? pct(best) : 'Not taken'}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Pass mark</dt>
          <dd className="mt-0.5 font-headline text-lg font-bold text-on-surface">{pct(script.unitQuizPassMark)}</dd>
        </div>
      </dl>
      <ActionLink to={`${script.basePath}/quiz/${unit.id}`} variant={passed ? 'outline' : 'primary'}>
        <Icon name="quiz" className="text-xl" />
        {passed ? 'Retake quiz' : best !== undefined ? 'Try the quiz again' : 'Take the quiz'}
      </ActionLink>
    </div>
  )
}
