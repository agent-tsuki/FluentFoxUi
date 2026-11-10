import { useEffect, useState } from 'react'
import type { KanjiEntry } from '@/types/kanji'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useKanjiStrokes } from '@/hooks/useKanji'
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
import { TextLink } from '@/components/ui/TextLink'

/**
 * KanjiLesson — the Learn step: one kanji at a time (meaning, key reading,
 * key word with audio, memory hint, stroke order), in batches of
 * `batchSize`. Showing a kanji marks it as seen for this visit; the tabs
 * above jump to any kanji and show which are done. Once every kanji has been
 * shown, `onLearned` runs (it ticks the unit's Learn step).
 */
interface KanjiLessonProps {
  entries: KanjiEntry[]
  batchSize: number
  /** Called after the last kanji, e.g. to move on to Write. */
  onFinish?: () => void
  /** Called once every kanji has been shown. */
  onLearned?: () => void
}

export function KanjiLesson({ entries, batchSize, onFinish, onLearned }: KanjiLessonProps) {
  const [at, setAt] = useState(0)
  const [seenChars, setSeenChars] = useState<ReadonlySet<string>>(() => new Set())
  const entry = entries[at]

  useEffect(() => {
    if (entry) setSeenChars((seen) => (seen.has(entry.char) ? seen : new Set(seen).add(entry.char)))
  }, [entry])

  const allSeen = entries.length > 0 && entries.every((e) => seenChars.has(e.char))
  useEffect(() => {
    if (allSeen) onLearned?.()
    // Once per visit: a new callback identity must not report again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSeen])

  if (!entry) return null
  const isLast = at === entries.length - 1
  const endsBatch = (at + 1) % batchSize === 0 && !isLast

  return (
    <div>
      <div role="tablist" aria-label="Kanji in this unit" className="flex flex-wrap gap-1.5">
        {entries.map((e, i) => {
          const seen = seenChars.has(e.char)
          return (
            <button
              key={e.char}
              type="button"
              role="tab"
              aria-selected={i === at}
              aria-label={`${e.char}, ${e.meanings[0]}${seen ? ', learned' : ''}`}
              onClick={() => setAt(i)}
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-md border font-ja text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                i === at ? 'border-primary bg-primary/10 text-ink' : 'border-line text-ink-muted hover:bg-surface-hover',
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
        <p className="text-sm tabular-nums text-ink-muted">
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
  const { speak, supported, loadingText } = useJapaneseSpeech()
  const strokes = useKanjiStrokes(entry.char)
  const key = entry.vocab.find((v) => v.isKey) ?? entry.vocab[0]
  const others = entry.vocab.filter((v) => v !== key).slice(0, 3)

  return (
    <article
      aria-label={`${entry.char}: ${entry.meanings[0]}`}
      className="mt-4 grid gap-6 rounded-xl bg-surface-raised shadow-elevation-1 p-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:p-6"
    >
      <div className="min-w-0 space-y-4">
        <div className="flex items-end gap-4">
          <p lang="ja" className="font-ja text-7xl font-bold leading-none text-ink">
            {entry.char}
          </p>
          <div className="min-w-0 pb-1">
            <p className="font-display text-2xl font-bold text-ink">{entry.meanings[0]}</p>
            {entry.meanings.length > 1 && <p className="truncate text-sm text-ink-muted">{entry.meanings.slice(1, 4).join(', ')}</p>}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Learn this reading first</p>
          <p lang="ja" className="mt-1 font-ja text-2xl font-bold text-primary">
            {keyReadingLabel(entry)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Also: <span lang="ja" className="font-ja">{[...entry.on, ...entry.kun.filter((k) => !k.affix).map(kunLabel)].filter((r) => r !== keyReadingLabel(entry)).slice(0, 5).join('、') || '—'}</span>
          </p>
          {entry.readingTip && <p className="mt-2 text-sm text-ink">{entry.readingTip}</p>}
        </div>

        {key && (
          <div className="flex items-center gap-3 rounded-md bg-surface-sunken p-3">
            <div className="min-w-0 flex-1">
              <p>
                <span lang="ja" className="font-ja text-xl font-bold text-ink">
                  {key.word}
                </span>{' '}
                <span lang="ja" className="font-ja text-ink-muted">
                  {key.reading}
                </span>
              </p>
              <p className="text-sm text-ink-muted">{key.meaning}</p>
            </div>
            {supported && <SpeakerButton onClick={() => speak(key.reading)} label={`Play ${key.word}`} loading={loadingText === key.reading} />}
          </div>
        )}

        {entry.mnemonic && (
          <p className="flex gap-2 text-sm text-ink">
            <Icon name="lightbulb" className="shrink-0 text-lg text-primary" />
            <span>{entry.mnemonic.text}</span>
          </p>
        )}

        {others.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
            {others.map((v) => (
              <li key={v.word}>
                <span lang="ja" className="font-ja text-ink">
                  {v.word}
                </span>{' '}
                {v.meaning.split(';')[0]}
              </li>
            ))}
          </ul>
        )}

        <TextLink to={kanjiCharPath(entry.char, entry.jlpt)}>Everything about {entry.char}</TextLink>
      </div>

      <div>
        {strokes.status === 'ready' ? (
          <StrokeOrder glyph={kanjiGlyph(strokes.data)} character={entry.char} />
        ) : strokes.status === 'loading' ? (
          <SkeletonBlock className="aspect-square w-full rounded-xl" />
        ) : (
          <p className="text-sm text-ink-muted">Stroke order isn’t available right now.</p>
        )}
      </div>
    </article>
  )
}
