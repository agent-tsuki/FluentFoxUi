import { useEffect, useRef, useState } from 'react'
import type { QuizCategory, QuizJlptLevel, QuizQuestionData, QuizResultData } from '@/types'
import { getQuizQuestions } from '@/api/services/quizGameService'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { OptionGrid } from './OptionGrid'
import { QuizResults } from './QuizResults'

type Phase = 'showing' | 'correct' | 'wrong' | 'finished'

interface QuizGameProps {
  category: QuizCategory
  level: QuizJlptLevel
  questionCount?: number
  onExit: () => void
}

export function QuizGame({ category, level, questionCount = 10, onExit }: QuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestionData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('showing')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [missedQuestions, setMissedQuestions] = useState<QuizQuestionData[]>([])
  const [result, setResult] = useState<QuizResultData | null>(null)
  const startTime = useRef(Date.now())
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const qs = getQuizQuestions(category, level, questionCount)
    setQuestions(qs)
    startTime.current = Date.now()
  }, [category, level, questionCount])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  function handleSelect(option: string) {
    if (phase !== 'showing') return
    const question = questions[currentIndex]
    const isCorrect = option === question.correctAnswer

    setSelectedOption(option)

    if (isCorrect) {
      const newStreak = streak + 1
      setScore((s) => s + 1)
      setStreak(newStreak)
      setMaxStreak((ms) => Math.max(ms, newStreak))
      setPhase('correct')
    } else {
      setStreak(0)
      setMissedQuestions((prev) => [...prev, question])
      setPhase('wrong')
    }

    // Advance to next question after feedback delay
    advanceTimer.current = setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= questions.length) {
        const elapsed = Math.round((Date.now() - startTime.current) / 1000)
        setResult({
          score: isCorrect ? score + 1 : score,
          total: questions.length,
          timeElapsed: elapsed,
          missedQuestions: isCorrect ? missedQuestions : [...missedQuestions, question],
          maxStreak: isCorrect ? Math.max(maxStreak, streak + 1) : maxStreak,
        })
        setPhase('finished')
      } else {
        setCurrentIndex(nextIndex)
        setPhase('showing')
        setSelectedOption(null)
      }
    }, 1200)
  }

  function handleRetry() {
    const qs = getQuizQuestions(category, level, questionCount)
    setQuestions(qs)
    setCurrentIndex(0)
    setPhase('showing')
    setSelectedOption(null)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setMissedQuestions([])
    setResult(null)
    startTime.current = Date.now()
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const question = questions[Math.min(currentIndex, questions.length - 1)]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 pt-20">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold font-label text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Exit
        </button>
        <span className="text-xs font-bold font-label text-white/30 uppercase tracking-widest">
          {category} · {level.toUpperCase()}
        </span>
      </div>

      {/* Progress */}
      <QuizProgress
        current={currentIndex + 1}
        total={questions.length}
        score={score}
        streak={streak}
      />

      {/* Question */}
      <QuizQuestion question={question} phase={phase} />

      {/* Options */}
      <OptionGrid
        question={question}
        phase={phase}
        selectedOption={selectedOption}
        onSelect={handleSelect}
      />

      {/* Results modal overlay */}
      {phase === 'finished' && result && (
        <QuizResults result={result} onRetry={handleRetry} onExit={onExit} />
      )}
    </div>
  )
}
