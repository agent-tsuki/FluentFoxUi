import { useState } from 'react'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { CHAPTER_GRAMMAR_TRACK } from '@/lib/learn/paths'
import { ChapterQuiz } from './ChapterQuiz'
import { PracticeIntro } from './PracticeIntro'

interface ChapterExerciseProps {
  level: string
  chapterId: number
  /** Best score so far, 0–100. */
  best?: number
  /** After an attempt is recorded (refresh the chapter's progress). */
  onRecorded?: () => void
}

const ITEMS = [
  { icon: 'unfold_more', title: 'Fill the gap', summary: 'Pick the missing word from a dropdown; once you know a sentence well, type it.' },
  { icon: 'checklist', title: 'What does it mean?', summary: 'Read the whole sentence, pick its English.' },
]

/**
 * A chapter's Exercise tab: the chapter's sentences from the learn API, each
 * asked as a gap and as a translation. Answers are saved and the sentences
 * join reviews; passing completes the chapter when the learner's settings
 * say so (Settings → Learning).
 */
export function ChapterExercise({ level, chapterId, best, onRecorded }: ChapterExerciseProps) {
  const [running, setRunning] = useState(false)
  if (running) {
    return (
      <ChapterQuiz
        track={CHAPTER_GRAMMAR_TRACK}
        chapterSlug={`ch${chapterId}`}
        title={`Chapter ${chapterId} exercise`}
        onExit={() => setRunning(false)}
        onRecorded={onRecorded}
      />
    )
  }
  return (
    <LearnerOnly prompt="inline">
      <PracticeIntro
        heading="Practise this chapter"
        line={`Each sentence of the chapter, twice. Your answers are saved and the sentences come back in your reviews.${
          best !== undefined ? ` Your best so far: ${best}%.` : ''
        }`}
        items={ITEMS}
        startLabel={level.toLowerCase() === 'n5' && best !== undefined ? 'Try again' : 'Start exercise'}
        onStart={() => setRunning(true)}
      />
    </LearnerOnly>
  )
}
