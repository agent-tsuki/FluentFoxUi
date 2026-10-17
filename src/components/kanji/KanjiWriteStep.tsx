import { useState } from 'react'
import type { KanjiEntry } from '@/types/kanji'
import { useKanjiStrokes } from '@/hooks/useKanji'
import { TracePad, type TraceGuide } from '@/components/kana/TracePad'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { keyReadingLabel } from '@/components/kanjiQuiz/buildKanjiQuestions'
import { kanjiGlyph } from './kanjiGlyph'
import { cn } from '@/lib/cn'

const STAGES: { guide: TraceGuide; title: string; verb: string }[] = [
  { guide: 'full', title: 'Trace', verb: 'traced' },
  { guide: 'faded', title: 'Faded guide', verb: 'written' },
  { guide: 'none', title: 'From memory', verb: 'written from memory' },
]

/**
 * KanjiWriteStep — writes each of a unit's kanji three times with less help
 * each time: trace, then a faded guide, then a blank grid (from the meaning
 * and reading). `onComplete` runs once every kanji has been written from memory.
 */
export function KanjiWriteStep({ entries, onComplete }: { entries: KanjiEntry[]; onComplete: () => void }) {
  const [at, setAt] = useState(0)
  const [stage, setStage] = useState(0)
  const [stageDone, setStageDone] = useState(false)
  const entry = entries[at]
  const isLastStage = stage === STAGES.length - 1
  const isLastKanji = at === entries.length - 1

  const advance = () => {
    setStageDone(false)
    if (!isLastStage) setStage((s) => s + 1)
    else if (!isLastKanji) {
      setAt((i) => i + 1)
      setStage(0)
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold tabular-nums text-on-surface">
          Kanji {at + 1} of {entries.length} · {STAGES[stage].title}
        </p>
        <ol aria-label="Writing stages" className="flex gap-1">
          {STAGES.map((s, i) => (
            <li
              key={s.guide}
              className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', i === stage ? 'bg-primary/10 text-primary' : i < stage ? 'text-success' : 'text-on-surface-variant')}
            >
              {i < stage && <span className="sr-only">Done: </span>}
              {s.title}
            </li>
          ))}
        </ol>
      </div>

      <p className="mb-3 text-on-surface">
        {stage === 2 ? 'Write the kanji for ' : 'Write '}
        <span className="font-bold">“{entry.meanings[0]}”</span>{' '}
        <span lang="ja" className="font-jp text-on-surface-variant">
          {keyReadingLabel(entry)}
        </span>
        {stage < 2 && (
          <span lang="ja" className="ml-2 font-jp text-xl font-bold">
            {entry.char}
          </span>
        )}
      </p>

      <WritePad
        key={`${entry.char}-${stage}`}
        char={entry.char}
        guide={STAGES[stage].guide}
        verb={STAGES[stage].verb}
        onDone={() => {
          setStageDone(true)
          if (isLastStage && isLastKanji) onComplete()
        }}
      />

      <div className="mt-3 flex justify-end">
        {!(isLastStage && isLastKanji) && (
          <Button onClick={advance} variant={stageDone ? 'primary' : 'outline'} className="flex min-h-11 items-center gap-1">
            {stageDone ? 'Next' : 'Skip'} <Icon name="arrow_forward" className="text-lg" />
          </Button>
        )}
      </div>
    </div>
  )
}

function WritePad({ char, guide, verb, onDone }: { char: string; guide: TraceGuide; verb: string; onDone: () => void }) {
  const strokes = useKanjiStrokes(char)
  if (strokes.status === 'loading') return <SkeletonBlock className="mx-auto aspect-square w-full max-w-[18rem] rounded-2xl" />
  if (strokes.status === 'error') return <ErrorState title="Couldn't load strokes" message="Check your connection and try again." onRetry={strokes.retry} className="py-6" />
  if (strokes.status === 'missing') return <p className="text-sm text-on-surface-variant">Stroke data isn’t available for this kanji yet.</p>
  return <TracePad glyph={kanjiGlyph(strokes.data)} guide={guide} verb={verb} onComplete={onDone} />
}
