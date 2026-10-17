import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { KanjiEntry } from '@/types/kanji'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useKanjiProgress, useKanjiStrokes } from '@/hooks/useKanji'
import { getKanjiProgress, isKanjiSeen } from '@/api/services/kanjiProgressService'
import { kanjiCharPath } from '@/lib/content/kanji/levels'
import { kunLabel } from '@/lib/content/kanji/kanjiText'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { StrokeOrder } from '@/components/kana/StrokeOrder'
import { kanjiGlyph } from './kanjiGlyph'
import { keyReadingLabel } from '@/components/kanjiQuiz/buildKanjiQuestions'
import { cn } from '@/lib/cn'

/**
 * KanjiLesson — the Learn step: one kanji at a time (meaning, key reading,
 * key word with audio, memory hint, stroke order), in batches of
 * `batchSize`. Showing a kanji marks it as seen; the tabs above jump to any
 * kanji and show which are done.
 */
interface KanjiLessonProps {
  entries: KanjiEntry[]
  batchSize: number
  /** Called after the last kanji, e.g. to move on to Write. */
  onFinish?: () => void
}

export function KanjiLesson({ entries, batchSize, onFinish }: KanjiLessonProps) {
  const progress = useKanjiProgress()
  const [at, setAt] = useState(() => Math.max(0, entries.findIndex((e) => !isKanjiSeen(progress, e.char))))
  const entry = entries[at]

  useEffect(() => {
    if (entry) getKanjiProgress().markSeen(entry.char)
  }, [entry])

  if (!entry) return null
  const isLast = at === entries.length - 1
  const endsBatch = (at + 1) % batchSize === 0 && !isLast

  return (
    <div>
      <div role="tablist" aria-label="Kanji in this unit" className="flex flex-wrap gap-1.5">
        {entries.map((e, i) => {
          const seen = isKanjiSeen(progress, e.char)
          return (
            <button
              key={e.char}
              type="button"
              role="tab"
              aria-selected={i === at}
              aria-label={`${e.char}, ${e.meanings[0]}${seen ? ', learned' : ''}`}
              onClick={() => setAt(i)}
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-xl border font-jp text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                i === at ? 'border-primary bg-primary/10 text-on-surface' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low',
                i > 0 && i % batchSize === 0 && 'ml-3',
              )}
            >
              <span lang="ja" aria-hidden>
                {e.char}
              </span>
              {seen && (
                <span aria-hidden className="absolute -right-1 -top-1 flex rounded-full bg-surface">
                  <Icon name="check_circle" filled className="text-base text-success" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <LessonCard key={entry.char} entry={entry} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setAt((i) => Math.max(0, i - 1))} disabled={at === 0} className="flex min-h-11 items-center gap-1 disabled:opacity-40">
          <Icon name="arrow_back" className="text-lg" /> Back
        </Button>
        <p className="text-sm tabular-nums text-on-surface-variant">
          {at + 1} of {entries.length}
          {endsBatch && ' · end of this set'}
        </p>
        {isLast ? (
          <Button onClick={onFinish} className="flex min-h-11 items-center gap-1">
            Done <Icon name="check" className="text-lg" />
          </Button>
        ) : (
          <Button onClick={() => setAt((i) => i + 1)} className="flex min-h-11 items-center gap-1">
            Next <Icon name="arrow_forward" className="text-lg" />
          </Button>
        )}
      </div>
    </div>
  )
}

function LessonCard({ entry }: { entry: KanjiEntry }) {
  const { speak, supported } = useJapaneseSpeech()
  const strokes = useKanjiStrokes(entry.char)
  const key = entry.vocab.find((v) => v.isKey) ?? entry.vocab[0]
  const others = entry.vocab.filter((v) => v !== key).slice(0, 3)

  return (
    <article
      aria-label={`${entry.char}: ${entry.meanings[0]}`}
      className="mt-4 grid gap-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:grid-cols-[minmax(0,1fr)_13rem] sm:p-6"
    >
      <div className="min-w-0 space-y-4">
        <div className="flex items-end gap-4">
          <p lang="ja" className="font-jp text-7xl font-bold leading-none text-on-surface">
            {entry.char}
          </p>
          <div className="min-w-0 pb-1">
            <p className="font-headline text-2xl font-bold text-on-surface">{entry.meanings[0]}</p>
            {entry.meanings.length > 1 && <p className="truncate text-sm text-on-surface-variant">{entry.meanings.slice(1, 4).join(', ')}</p>}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Learn this reading first</p>
          <p lang="ja" className="mt-1 font-jp text-2xl font-bold text-primary">
            {keyReadingLabel(entry)}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Also: <span lang="ja" className="font-jp">{[...entry.on, ...entry.kun.filter((k) => !k.affix).map(kunLabel)].filter((r) => r !== keyReadingLabel(entry)).slice(0, 5).join('、') || '—'}</span>
          </p>
          {entry.readingTip && <p className="mt-2 text-sm text-on-surface">{entry.readingTip}</p>}
        </div>

        {key && (
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
            <div className="min-w-0 flex-1">
              <p>
                <span lang="ja" className="font-jp text-xl font-bold text-on-surface">
                  {key.word}
                </span>{' '}
                <span lang="ja" className="font-jp text-on-surface-variant">
                  {key.reading}
                </span>
              </p>
              <p className="text-sm text-on-surface-variant">{key.meaning}</p>
            </div>
            {supported && <SpeakerButton onClick={() => speak(key.reading)} label={`Play ${key.word}`} />}
          </div>
        )}

        {entry.mnemonic && (
          <p className="flex gap-2 text-sm text-on-surface">
            <Icon name="lightbulb" className="shrink-0 text-lg text-primary" />
            <span>{entry.mnemonic.text}</span>
          </p>
        )}

        {others.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
            {others.map((v) => (
              <li key={v.word}>
                <span lang="ja" className="font-jp text-on-surface">
                  {v.word}
                </span>{' '}
                {v.meaning.split(';')[0]}
              </li>
            ))}
          </ul>
        )}

        <Link
          to={kanjiCharPath(entry.char, entry.jlpt)}
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Everything about {entry.char}
          <Icon name="chevron_right" className="text-lg" />
        </Link>
      </div>

      <div>
        {strokes.status === 'ready' ? (
          <StrokeOrder glyph={kanjiGlyph(strokes.data)} character={entry.char} />
        ) : strokes.status === 'loading' ? (
          <SkeletonBlock className="aspect-square w-full rounded-2xl" />
        ) : (
          <p className="text-sm text-on-surface-variant">Stroke order isn’t available right now.</p>
        )}
      </div>
    </article>
  )
}
