import { memo, useId, useState, type ReactNode } from 'react'
import type { ChapterWordContent, GrammarChapter } from '@/types/grammar'
import { useChapterContent } from '@/hooks/useChapterContent'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { CHAPTER_VOCAB_TRACK } from '@/lib/learn/paths'
import { cn } from '@/lib/cn'
import { ChapterQuiz } from './ChapterQuiz'

type ChapterWord = ChapterWordContent

interface ChapterVocabularyProps {
  chapter: GrammarChapter
  /** Best vocab quiz score so far, 0–100. */
  best?: number
  /** After a vocab quiz attempt is recorded (refresh the chapter's progress). */
  onRecorded?: () => void
  /** The step's ContinueBar, shown with the word list. */
  footer?: ReactNode
}

/**
 * A chapter's Vocabulary step: its words from the content API in one table, with
 * the meaning always visible, and the chapter's vocab quiz. Taking the quiz
 * puts the words into reviews.
 */
export function ChapterVocabulary({ chapter, best, onRecorded, footer }: ChapterVocabularyProps) {
  const { speak, supported, loadingText } = useJapaneseSpeech()
  const content = useChapterContent(chapter.level, chapter.id)
  const [quiz, setQuiz] = useState(false)
  const words = content.data?.words ?? []

  if (quiz) {
    return (
      <ChapterQuiz
        track={CHAPTER_VOCAB_TRACK}
        chapterSlug={`ch${chapter.id}`}
        title={`Chapter ${chapter.id} vocab quiz`}
        onExit={() => setQuiz(false)}
        onRecorded={onRecorded}
      />
    )
  }

  if (content.isLoading || (!content.data && !content.error)) {
    return (
      <LoadingState label="Loading words…" className="space-y-2 py-2">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonBlock key={i} className="h-12 rounded-md" />
        ))}
      </LoadingState>
    )
  }
  if (content.error) {
    return (
      <div className="py-2">
        <ErrorState message="We couldn't load this chapter's words." onRetry={content.refetch} />
      </div>
    )
  }
  if (words.length === 0) {
    return (
      <div className="py-2">
        <EmptyState icon="translate" title="No new words in this chapter" description="This chapter builds on words you already know. Try its exercise." />
      </div>
    )
  }

  return (
    <div className="grid gap-12">
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Words in this chapter</h1>
            <p className="mt-1 text-body text-ink-muted">
              {words.length} words{best !== undefined ? ` · vocab quiz best ${best}%` : ''}
            </p>
          </div>
          <LearnerOnly prompt="inline">
            <Button variant="secondary" onClick={() => setQuiz(true)}>
              <Icon name="quiz" className="text-lg" />
              {best !== undefined ? 'Retake vocab quiz' : 'Take the vocab quiz'}
            </Button>
          </LearnerOnly>
        </div>
        <div className="overflow-hidden rounded-lg bg-surface-raised shadow-elevation-1">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Words in chapter {chapter.id}</caption>
            <thead className="bg-surface-sunken text-eyebrow uppercase text-ink-muted">
              <tr>
                <th scope="col" className="px-3 py-3 sm:px-4">Word</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Kana</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Romaji</th>
                <th scope="col" className="px-3 py-3 sm:px-4">Meaning</th>
                <th scope="col" className="w-12 px-1 py-3 text-center">Hint</th>
                <th scope="col" className="w-14 px-1 py-3"><span className="sr-only">Audio</span></th>
              </tr>
            </thead>
            <tbody>
              {words.map((w, i) => (
                <WordRow key={`${w.word}-${i}`} word={w} canSpeak={supported} loading={loadingText === (w.say ?? w.kana)} onSpeak={speak} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {footer}
    </div>
  )
}

interface WordRowProps {
  word: ChapterWord
  canSpeak: boolean
  loading: boolean
  onSpeak: (text: string) => void
}

/** Columns in a row, including the two that phones fold under Word and Meaning. */
const COLUMNS = 6

/** One word. Below `sm` the kana sits under the word and the romaji under the meaning, so nothing scrolls sideways. */
const WordRow = memo(function WordRow({ word, canSpeak, loading, onSpeak }: WordRowProps) {
  const [hintOpen, setHintOpen] = useState(false)
  const hintId = useId()
  return (
    <>
      <tr className="border-t border-line align-middle transition-colors duration-fast hover:bg-surface-hover">
        <th scope="row" className="px-3 py-2.5 font-normal sm:px-4">
          <span lang="ja" className="block font-ja text-ja-sm font-bold text-ink">
            {word.word}
          </span>
          {word.kana !== word.word && (
            <span lang="ja" className="block font-ja text-caption text-primary-ink sm:hidden">
              {word.kana}
            </span>
          )}
        </th>
        <td lang="ja" className="hidden whitespace-nowrap px-4 py-2.5 font-ja text-body text-primary-ink sm:table-cell">
          {word.kana}
        </td>
        <td className="hidden whitespace-nowrap px-4 py-2.5 text-body text-ink-muted sm:table-cell">{word.romaji}</td>
        <td className="px-3 py-2.5 sm:px-4">
          <span className="block text-body text-ink">{word.meaning}</span>
          <span className="block text-caption text-ink-subtle sm:hidden">{word.romaji}</span>
        </td>
        <td className="px-1 py-1 text-center">
          {word.hint ? (
            <button
              type="button"
              aria-expanded={hintOpen}
              aria-controls={hintId}
              aria-label={`${hintOpen ? 'Hide' : 'Show'} hint for ${word.word}`}
              onClick={() => setHintOpen((o) => !o)}
              className={cn(
                'inline-grid size-touch-target place-items-center rounded-full transition-colors duration-fast',
                hintOpen ? 'bg-primary-soft text-primary-ink' : 'text-ink-muted hover:bg-surface-sunken',
              )}
            >
              <Icon name="lightbulb" filled={hintOpen} className="text-xl" />
            </button>
          ) : (
            <span aria-hidden className="text-ink-subtle">
              —
            </span>
          )}
        </td>
        <td className="px-1 py-1">
          {canSpeak && <SpeakerButton onClick={() => onSpeak(word.say ?? word.kana)} label={`Play ${word.word}`} loading={loading} className="bg-surface-sunken text-ink-muted hover:bg-surface-hover hover:text-primary" />}
        </td>
      </tr>
      {word.hint && (
        <tr id={hintId} hidden={!hintOpen}>
          <td colSpan={COLUMNS} className="bg-primary-soft px-4 py-2 text-caption text-primary-ink">
            {word.hint}
          </td>
        </tr>
      )}
    </>
  )
})
