import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { GrammarChapter, GrammarConcept, GrammarExample, JapaneseSegment } from '@/types/grammar'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { ChapterVisual } from '@/components/grammar/ChapterVisual'
import { RichHtml } from '@/components/grammar/RichHtml'
import { Callout } from '@/components/lesson/Callout'
import { LessonToolbar } from '@/components/lesson/LessonToolbar'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { cn } from '@/lib/cn'
import { chapterPath } from '@/lib/content/jlpt/levels'

interface GrammarContentProps {
  chapter: GrammarChapter
  prevChapterId?: number
  nextChapterId?: number
  isCompleted: boolean
  /** The step's ContinueBar. */
  footer: ReactNode
}

const KANJI = /[一-鿿々]/

/** A sentence as speakable text: readings where we have them, with the markup removed. */
function speakableText(segments: readonly JapaneseSegment[]): string {
  return segments.map((s) => (typeof s === 'string' ? s.replace(/<[^>]*>/g, '') : s.reading || s.kanji)).join('')
}

function Segments({ segments }: { segments: readonly JapaneseSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (typeof seg === 'string') return <span key={i} dangerouslySetInnerHTML={{ __html: seg }} />
        if (!seg.reading || !KANJI.test(seg.kanji)) return <span key={i}>{seg.kanji}</span>
        return (
          <ruby key={i}>
            {seg.kanji}
            <rt>{seg.reading}</rt>
          </ruby>
        )
      })}
    </>
  )
}

interface ExampleSentenceProps {
  example: GrammarExample
  speech: ReturnType<typeof useJapaneseSpeech>
}

function ExampleSentence({ example, speech }: ExampleSentenceProps) {
  const text = speakableText(example.japanese)
  return (
    <div className="lesson-example grid gap-1 rounded-lg bg-surface-sunken px-5 py-4">
      <div className="flex items-start gap-3">
        <p lang="ja" className="flex-1 font-ja text-ja-lg text-ink">
          <Segments segments={example.japanese} />
        </p>
        {speech.supported && (
          <SpeakerButton
            onClick={() => speech.speak(text)}
            label="Play audio"
            loading={speech.loadingText === text}
            className="mt-1 bg-surface-raised text-ink-muted hover:bg-surface-hover hover:text-primary"
          />
        )}
      </div>
      {example.romaji && <p className="lesson-romaji text-sm font-medium text-ink-subtle">{example.romaji}</p>}
      <p className="lesson-english text-body text-ink-muted">{example.english}</p>
    </div>
  )
}

interface ConceptCardProps {
  concept: GrammarConcept
  index: number
  total: number
  speech: ReturnType<typeof useJapaneseSpeech>
}

function ConceptCard({ concept, index, total, speech }: ConceptCardProps) {
  return (
    <section id={`concept-${index + 1}`} className="overflow-hidden rounded-xl bg-surface-raised shadow-elevation-1">
      <header className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-ink">{concept.id}</span>
          <h2 className="font-display text-h3 text-ink">{concept.title}</h2>
        </div>
        <span className="shrink-0 text-caption text-ink-subtle">
          {index + 1} / {total}
        </span>
      </header>

      <div className="space-y-4 px-6 py-6">
        <RichHtml className="lesson-prose text-body text-ink-muted" html={concept.description} />

        {concept.keyRule && (
          <Callout tone="rule" title="Key rule">
            <RichHtml as="p" className="[&>br:first-child]:hidden" html={concept.keyRule} />
          </Callout>
        )}

        {concept.note && (
          <Callout tone="note" title="Note">
            <RichHtml as="p" html={concept.note} />
          </Callout>
        )}

        {concept.examples && concept.examples.length > 0 && (
          <div className="pt-2">
            <h3 className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-ink-muted">
              <Icon name="lightbulb" className="text-base text-primary" />
              Example sentences
            </h3>
            <div className="space-y-3">
              {concept.examples.map((example, i) => (
                <ExampleSentence key={i} example={example} speech={speech} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/** The chapter's words at a glance, each tappable to mark as known (kept on this device). */
function VocabCard({ chapter }: { chapter: GrammarChapter }) {
  const storageKey = `ff-vocab-${chapter.level}-${chapter.id}`
  const [mastered, setMastered] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setMastered(saved ? new Set(JSON.parse(saved)) : new Set())
    } catch {
      setMastered(new Set())
    }
  }, [storageKey])

  const toggle = (index: number) => {
    setMastered((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]))
      } catch {
        /* storage blocked: the ticks last for this visit only */
      }
      return next
    })
  }

  const words = chapter.sidebar.vocab
  return (
    <div className="overflow-hidden rounded-xl bg-surface-raised shadow-elevation-1">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-eyebrow uppercase text-ink-muted">
            <Icon name="menu_book" className="text-base text-primary" />
            Chapter vocabulary
          </h2>
          {words.length > 0 && (
            <span className="text-caption tabular-nums text-ink-muted">
              {mastered.size}/{words.length}
            </span>
          )}
        </div>
        {words.length > 0 && <ProgressBar value={mastered.size} max={words.length} label="Words marked as known" className="mt-2.5" />}
      </div>

      {words.length === 0 ? (
        <p className="px-5 py-8 text-center text-caption text-ink-muted">No vocabulary for this chapter.</p>
      ) : (
        <ul className="divide-y divide-line">
          {words.map((word, i) => {
            const known = mastered.has(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={known}
                  onClick={() => toggle(i)}
                  className={cn('flex min-h-touch-target w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-fast', known ? 'bg-surface-sunken' : 'hover:bg-surface-hover')}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span lang="ja" className={cn('font-ja text-ja-sm', known ? 'text-ink-muted' : 'text-ink')}>
                        {word.kanji}
                      </span>
                      <span lang="ja" className="font-ja text-xs font-bold text-primary-ink">
                        {word.reading}
                      </span>
                    </span>
                    <span className="block text-caption text-ink-muted">{word.meaning}</span>
                  </span>
                  {known && <Icon name="check" className="shrink-0 text-lg text-success" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {words.length > 0 && <p className="border-t border-line px-5 py-3 text-center text-caption text-ink-muted">Tap a word to mark it as known</p>}
    </div>
  )
}

function ChapterLink({ to, label, chapter, forward }: { to: string; label: string; chapter: number; forward?: boolean }) {
  return (
    <Link to={to} className={cn('group flex min-h-touch-target items-center gap-4 rounded-full', forward ? 'ml-auto text-right' : 'mr-auto')}>
      {!forward && (
        <span className="grid size-12 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors duration-fast group-hover:bg-surface-hover group-hover:text-ink">
          <Icon name="arrow_back" />
        </span>
      )}
      <span>
        <span className="block text-caption text-ink-muted">{label}</span>
        <span className="text-label text-ink">Chapter {chapter}</span>
      </span>
      {forward && (
        <span className="grid size-12 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors duration-fast group-hover:bg-surface-hover group-hover:text-ink">
          <Icon name="arrow_forward" />
        </span>
      )}
    </Link>
  )
}

/** A chapter's Grammar tab: header, picture board, concept cards beside the vocabulary panel, then the way on. */
export function GrammarContent({ chapter, prevChapterId, nextChapterId, isCompleted, footer }: GrammarContentProps) {
  const speech = useJapaneseSpeech()
  const hasRomaji = chapter.concepts.some((c) => c.examples?.some((e) => e.romaji))
  const culture = chapter.sidebar.culturalInsight
  const level = chapter.level.toLowerCase()

  return (
    <div className="w-full px-6 py-8 xl:px-10">
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Badge tone={isCompleted ? 'done' : 'neutral'}>{isCompleted ? 'Chapter complete' : `Chapter ${chapter.id}`}</Badge>
          <LessonToolbar chapter={chapter.id} available={hasRomaji ? undefined : ['furigana', 'english']} />
        </div>
        <h1 className="mb-4 font-display text-h1 text-ink">{chapter.title}</h1>
        <p className="max-w-reading text-body-lg text-ink-muted">{chapter.description}</p>

        {chapter.concepts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-2">
            {chapter.concepts.map((concept, i) => (
              <li key={concept.id}>
                <a href={`#concept-${i + 1}`} className="group inline-flex min-h-touch-target items-center">
                  <span className="rounded-full bg-surface-sunken px-3 py-1 text-caption text-ink-muted transition-colors duration-fast group-hover:bg-surface-hover group-hover:text-ink">
                    {i + 1}. {concept.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <ChapterVisual chapterId={chapter.id} />

      <div className="grid grid-cols-12 gap-6 xl:gap-8">
        <div className="col-span-12 space-y-6 lg:col-span-9">
          {chapter.concepts.map((concept, i) => (
            <ConceptCard key={concept.id} concept={concept} index={i} total={chapter.concepts.length} speech={speech} />
          ))}
        </div>

        <aside className="col-span-12 space-y-6 lg:col-span-3">
          <VocabCard chapter={chapter} />
          {culture && (
            <Callout tone="culture" title={culture.title || 'Cultural insight'}>
              <RichHtml className="text-caption [&_br+br]:hidden" html={culture.content} />
            </Callout>
          )}
        </aside>
      </div>

      <div className="mt-12 space-y-8">
        {footer}
        <div className="flex items-center">
          {prevChapterId !== undefined && <ChapterLink to={chapterPath(level, prevChapterId)} label="Previous" chapter={prevChapterId} />}
          {nextChapterId !== undefined && <ChapterLink to={chapterPath(level, nextChapterId)} label="Next" chapter={nextChapterId} forward />}
        </div>
      </div>
    </div>
  )
}
