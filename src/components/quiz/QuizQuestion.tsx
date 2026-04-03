import { useEffect, useState } from 'react'
import type { QuizQuestionData } from '@/types'

interface QuizQuestionProps {
  question: QuizQuestionData
  phase: 'showing' | 'correct' | 'wrong'
}

export function QuizQuestion({ question, phase }: QuizQuestionProps) {
  const [animKey, setAnimKey] = useState(0)

  // Re-trigger entrance animation on each new question
  useEffect(() => {
    setAnimKey((k) => k + 1)
  }, [question.id])

  const isJapanese =
    question.type === 'hiragana-to-romaji' ||
    question.type === 'kanji-to-meaning' ||
    question.type === 'kanji-to-onyomi'

  const phaseColor =
    phase === 'correct'
      ? 'text-emerald-600'
      : phase === 'wrong'
      ? 'text-red-600'
      : 'text-on-surface'

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 select-none">
      {/* Question label */}
      <p className="text-xs font-label font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-8">
        {question.promptLabel}
      </p>

      {/* Main character / prompt */}
      <div
        key={animKey}
        className={`animate-quiz-char-drop relative flex items-center justify-center ${phaseColor} transition-colors duration-300`}
      >
        {/* Watermark glow */}
        <span
          aria-hidden
          className={`absolute ${isJapanese ? 'japanese-text' : 'font-headline'} font-black pointer-events-none select-none
            text-[20vw] sm:text-[16vw] md:text-[14vw] opacity-[0.04] blur-sm`}
        >
          {question.prompt}
        </span>

        {/* Primary character */}
        <span
          className={`relative z-10 font-black leading-none
            text-[22vw] sm:text-[18vw] md:text-[15vw] lg:text-[12vw]
            ${isJapanese ? 'japanese-text' : 'font-headline'}`}
        >
          {question.prompt}
        </span>
      </div>

      {/* Phase feedback label */}
      <div className="h-8 mt-4 flex items-center">
        {phase === 'correct' && (
          <span className="text-sm font-bold font-label text-emerald-600 animate-score-pop inline-block">
            Correct! ✓
          </span>
        )}
        {phase === 'wrong' && (
          <span className="text-sm font-bold font-label text-red-600">
            Wrong — keep going
          </span>
        )}
      </div>
    </div>
  )
}
