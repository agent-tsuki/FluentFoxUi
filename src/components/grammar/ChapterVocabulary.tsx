import { memo, useId, useState } from 'react'
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
}

/**
 * A chapter's Vocabulary tab: its words from the content API in a table (as
 * written, kana, romaji, meaning, a memory hint behind a button where one
 * helps, audio on the right), and the chapter's vocab quiz. Taking the quiz
 * puts the words into reviews.
 */
export function ChapterVocabulary({ chapter, best, onRecorded }: ChapterVocabularyProps) {
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
      <LoadingState label="Loading words…" className="space-y-2 px-6 py-8 xl:px-10">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonBlock key={i} className="h-12 rounded-xl" />
        ))}
      </LoadingState>
    )
  }
  if (content.error) {
    return (
      <div className="px-6 py-10 xl:px-10">
        <ErrorState message="We couldn't load this chapter's words." onRetry={content.refetch} />
      </div>
    )
  }
  if (words.length === 0) {
    return (
      <div className="px-6 py-10 xl:px-10">
        <EmptyState icon="translate" title="No new words in this chapter" description="This chapter builds on words you already know. Try its exercise." />
      </div>
    )
  }

  return (
    <div className="px-6 py-8 xl:px-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">Words in this chapter</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {words.length} words. Tap the speaker to hear one{best !== undefined ? ` · vocab quiz best ${best}%` : ''}.
          </p>
        </div>
        <LearnerOnly prompt="inline">
          <Button onClick={() => setQuiz(true)} className="flex items-center gap-2">
            <Icon name="quiz" className="text-lg" />
            {best !== undefined ? 'Retake vocab quiz' : 'Take the vocab quiz'}
          </Button>
        </LearnerOnly>
      </div>
      {/* Narrow screens scroll the table sideways inside this box; the Word column stays put. */}
      <div className="overflow-x-auto rounded-2xl border border-outline-variant/60 dark:border-outline/60">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Words in chapter {chapter.id}</caption>
          <thead className="bg-surface-container-low text-xs font-bold uppercase tracking-wide text-on-surface-variant dark:bg-surface-container">
            <tr>
              <th scope="col" className={cn(STICKY, 'bg-surface-container-low px-4 py-3 dark:bg-surface-container')}>
                Word
              </th>
              <th scope="col" className="px-4 py-3">
                Kana
              </th>
              <th scope="col" className="px-4 py-3">
                Romaji
              </th>
              <th scope="col" className="px-4 py-3">
                Meaning
              </th>
              <th scope="col" className="w-16 px-2 py-3 text-center">
                Hint
              </th>
              <th scope="col" className="w-16 px-2 py-3">
                <span className="sr-only">Audio</span>
              </th>
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
  )
}

/** The Word column stays visible while the table scrolls sideways. */
const STICKY = 'sticky left-0 z-[1]'

interface WordRowProps {
  word: ChapterWord
  canSpeak: boolean
  loading: boolean
  onSpeak: (text: string) => void
}

/** Columns in a row: word, kana, romaji, meaning, hint, audio (the hint row spans them all). */
const COLUMNS = 6

const WordRow = memo(function WordRow({ word, canSpeak, loading, onSpeak }: WordRowProps) {
  const [hintOpen, setHintOpen] = useState(false)
  const hintId = useId()
  const rowBg =
    'bg-surface-container-lowest transition-colors group-hover:bg-surface-container-low dark:bg-surface-container-low dark:group-hover:bg-surface-container'
  return (
    <>
      <tr className="group border-t border-outline-variant/40 align-middle">
        <th scope="row" className={cn(STICKY, rowBg, 'px-4 py-3 font-normal')}>
          <span lang="ja" className="whitespace-nowrap font-jp text-lg font-bold text-on-surface">
            {word.word}
          </span>
        </th>
        <td lang="ja" className={cn(rowBg, 'whitespace-nowrap px-4 py-3 font-jp text-base text-primary')}>
          {word.kana}
        </td>
        <td className={cn(rowBg, 'whitespace-nowrap px-4 py-3 text-on-surface-variant')}>{word.romaji}</td>
        <td className={cn(rowBg, 'px-4 py-3 text-on-surface')}>{word.meaning}</td>
        <td className={cn(rowBg, 'px-2 py-2 text-center')}>
          {word.hint ? (
            <button
              type="button"
              aria-expanded={hintOpen}
              aria-controls={hintId}
              aria-label={`${hintOpen ? 'Hide' : 'Show'} hint for ${word.word}`}
              onClick={() => setHintOpen((o) => !o)}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                hintOpen ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary hover:bg-primary/15',
              )}
            >
              <Icon name="lightbulb" filled={hintOpen} className="text-lg" />
            </button>
          ) : (
            <span aria-hidden className="text-on-surface-variant/40">
              —
            </span>
          )}
        </td>
        <td className={cn(rowBg, 'px-2 py-2')}>
          {canSpeak && <SpeakerButton onClick={() => onSpeak(word.say ?? word.kana)} label={`Play ${word.word}`} loading={loading} className="h-9 w-9" />}
        </td>
      </tr>
      {word.hint && (
        <tr id={hintId} hidden={!hintOpen}>
          <td colSpan={COLUMNS} className="bg-primary/5 px-4 pb-3 pt-1">
            <p className="flex gap-2 text-sm leading-snug text-on-surface">
              <Icon name="lightbulb" className="mt-0.5 shrink-0 text-base text-primary" />
              <span>{word.hint}</span>
            </p>
          </td>
        </tr>
      )}
    </>
  )
})
