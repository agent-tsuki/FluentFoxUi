import { useEffect, useState } from 'react'
import type { QuizQuestionData } from '@/types'

type Phase = 'showing' | 'correct' | 'wrong'

interface OptionGridProps {
  question: QuizQuestionData
  phase: Phase
  selectedOption: string | null
  onSelect: (option: string) => void
}

export function OptionGrid({ question, phase, selectedOption, onSelect }: OptionGridProps) {
  const [gridKey, setGridKey] = useState(0)

  // Re-trigger stagger animation on new question
  useEffect(() => {
    setGridKey((k) => k + 1)
  }, [question.id])

  function getButtonClass(option: string): string {
    const base =
      'w-full py-4 px-5 rounded-xl font-bold font-label text-sm text-left transition-all duration-200 border'

    if (phase === 'showing' && selectedOption === null) {
      return `${base} bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high hover:border-outline hover:scale-[1.02] active:scale-[0.98] cursor-pointer`
    }

    // After answering — reveal correct/wrong states
    if (option === question.correctAnswer) {
      return `${base} bg-emerald-500/20 border-emerald-500/50 text-emerald-700 animate-quiz-correct cursor-default`
    }

    if (option === selectedOption && option !== question.correctAnswer) {
      return `${base} bg-red-500/20 border-red-500/50 text-red-700 animate-quiz-shake cursor-default`
    }

    return `${base} bg-surface-container-lowest border-outline-variant/50 text-on-surface/30 cursor-default`
  }

  return (
    <div
      key={gridKey}
      className="grid grid-cols-2 gap-3 px-6 pb-8 w-full max-w-lg mx-auto"
    >
      {question.options.map((option) => (
        <button
          key={option}
          className={`option-rise ${getButtonClass(option)}`}
          onClick={() => phase === 'showing' && onSelect(option)}
          disabled={phase !== 'showing'}
        >
          {/* For Japanese options, use the japanese-text class */}
          <span
            className={
              /[\u3040-\u30FF\u4E00-\u9FFF]/.test(option) ? 'japanese-text text-base' : ''
            }
          >
            {option}
          </span>
        </button>
      ))}
    </div>
  )
}
