import { useState } from 'react'
import type { QuizCategory, QuizJlptLevel } from '@/types'
import { QuizConfig } from '@/components/sections/QuizConfig/QuizConfig'
import { QuizGame } from '@/components/quiz/QuizGame'

type Screen = 'config' | 'playing'

interface GameSession {
  category: QuizCategory
  level: QuizJlptLevel
}

export function QuizPage() {
  const [screen, setScreen] = useState<Screen>('config')
  const [session, setSession] = useState<GameSession>({ category: 'hiragana', level: 'n5' })

  function handleStart(category: QuizCategory, level: QuizJlptLevel) {
    setSession({ category, level })
    setScreen('playing')
  }

  function handleExit() {
    setScreen('config')
  }

  if (screen === 'playing') {
    return (
      <QuizGame
        category={session.category}
        level={session.level}
        questionCount={10}
        onExit={handleExit}
      />
    )
  }

  return <QuizConfig onStart={handleStart} />
}
