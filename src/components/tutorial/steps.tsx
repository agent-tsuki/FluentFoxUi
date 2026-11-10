import { lazy, Suspense, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { JlptLevel } from '@/types'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { WelcomeGoals } from '@/hooks/useWelcomeTour'

// lottie-web + the animation JSON: only fetched when a fox step is on screen.
const CelebrationFox = lazy(() => import('@/components/sections/KanaChart/CelebrationFox').then((m) => ({ default: m.CelebrationFox })))

const FOX_SIZE = 112

export function Fox() {
  return (
    <div className="mb-2 flex h-28 items-center justify-center">
      <Suspense fallback={<span aria-hidden className="text-6xl">🦊</span>}>
        <CelebrationFox size={FOX_SIZE} />
      </Suspense>
    </div>
  )
}

// ─── Goals ───────────────────────────────────────────────────────────────────

const LEVELS: readonly { value: JlptLevel; hint: string }[] = [
  { value: 'N5', hint: 'Just starting' },
  { value: 'N4', hint: 'Basics done' },
  { value: 'N3', hint: 'Everyday' },
  { value: 'N2', hint: 'Advanced' },
  { value: 'N1', hint: 'Mastery' },
]

const DAILY: readonly { value: number; label: string; time: string }[] = [
  { value: 10, label: 'Easy', time: '~5 min' },
  { value: 20, label: 'Steady', time: '~10 min' },
  { value: 40, label: 'Serious', time: '~20 min' },
]

const OPTION = 'flex min-h-touch-target flex-col items-center justify-center rounded-md border px-2 py-2 text-center transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
const optionTone = (on: boolean) => (on ? 'border-primary bg-primary/10 text-ink' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink')

export function GoalStep({ goals, onChange }: { goals: WelcomeGoals; onChange: (g: WelcomeGoals) => void }) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-label font-semibold text-ink">I want to reach</legend>
        <div role="radiogroup" aria-label="Target JLPT level" className="grid grid-cols-5 gap-1.5">
          {LEVELS.map((l) => {
            const on = goals.targetLevel === l.value
            return (
              <button key={l.value} type="button" role="radio" aria-checked={on} onClick={() => onChange({ ...goals, targetLevel: l.value })} className={cn(OPTION, optionTone(on))}>
                <span className="font-display text-body font-bold">{l.value}</span>
                <span className="text-2xs leading-tight">{l.hint}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-label font-semibold text-ink">Each day I'll practise</legend>
        <div role="radiogroup" aria-label="Daily goal" className="grid grid-cols-3 gap-1.5">
          {DAILY.map((d) => {
            const on = goals.dailyGoal === d.value
            return (
              <button key={d.value} type="button" role="radio" aria-checked={on} onClick={() => onChange({ ...goals, dailyGoal: d.value })} className={cn(OPTION, optionTone(on))}>
                <span className="text-label font-semibold">{d.label}</span>
                <span className="text-caption tabular-nums">{d.value} answers</span>
                <span className="text-2xs text-ink-subtle">{d.time}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
      <p className="text-caption text-ink-subtle">You can change both later in Settings.</p>
    </div>
  )
}

// ─── First kana ──────────────────────────────────────────────────────────────

const TARGET = 'あ'
const DECOYS = ['お', 'め']

/** Tap あ to hear it, then find it among look-alikes: a first win in under 20 seconds. */
export function FirstKanaStep({ won, onWin, reducedMotion }: { won: boolean; onWin: () => void; reducedMotion: boolean }) {
  const { speak, supported } = useJapaneseSpeech()
  const [heard, setHeard] = useState(won)
  const [wrong, setWrong] = useState<string | null>(null)
  const choices = useMemo(() => [DECOYS[0], TARGET, DECOYS[1]], [])

  const hear = () => {
    if (supported) speak(TARGET)
    setHeard(true)
  }

  if (!heard) {
    return (
      <div className="flex flex-col items-center gap-3 py-1">
        <motion.button
          type="button"
          onClick={hear}
          aria-label="Hear あ, said a"
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
          className="group relative flex size-32 items-center justify-center rounded-xl border border-line bg-surface font-ja text-[4.5rem] leading-none text-ink shadow-elevation-1 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {TARGET}
          <span className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-2">
            <Icon name="volume_up" className="text-xl" />
          </span>
        </motion.button>
        <p className="text-body text-ink-muted">Tap it to hear it</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-body text-ink-muted">
        That's <span className="font-semibold text-ink">“a”</span>, like the <em>a</em> in “father”. Now find it:
      </p>
      <div role="group" aria-label="Which one is a?" className="grid grid-cols-3 gap-2">
        {choices.map((c) => {
          const isRight = c === TARGET
          const showRight = won && isRight
          const showWrong = wrong === c && !won
          return (
            <motion.button
              key={c}
              type="button"
              disabled={won}
              onClick={() => {
                if (isRight) {
                  if (supported) speak(TARGET)
                  onWin()
                } else {
                  setWrong(c)
                }
              }}
              animate={showWrong && !reducedMotion ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              aria-label={c}
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg border font-ja text-[2.75rem] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                showRight ? 'border-success bg-success/10 text-success' : showWrong ? 'border-error bg-error/10 text-error' : 'border-line bg-surface text-ink hover:border-line-strong',
                won && !isRight && 'opacity-40',
              )}
            >
              {c}
            </motion.button>
          )
        })}
      </div>
      <p aria-live="polite" className="min-h-5 text-center text-label font-semibold">
        {won ? (
          <span className="text-success">Nice! Your first kana. 45 more to go.</span>
        ) : wrong ? (
          <span className="text-ink-muted">Close! {wrong} is a look-alike. あ starts with a cross at the top.</span>
        ) : null}
      </p>
    </div>
  )
}

// ─── Find your way ───────────────────────────────────────────────────────────

const SECTIONS: readonly { icon: string; name: string; what: string }[] = [
  { icon: 'translate', name: 'Kana', what: 'Hiragana & katakana, row by row' },
  { icon: 'history_edu', name: 'Kanji', what: 'N5 kanji with strokes and readings' },
  { icon: 'menu_book', name: 'Grammar', what: 'Short chapters with real sentences' },
  { icon: 'quiz', name: 'Practice', what: 'Reviews and drills when cards are due' },
]

export function NavStep() {
  return (
    <ul className="space-y-1.5">
      {SECTIONS.map((s) => (
        <li key={s.name} className="flex items-center gap-3 rounded-md bg-surface px-3 py-2">
          <Icon name={s.icon} className="text-xl text-primary" />
          <span>
            <span className="block text-label font-semibold text-ink">{s.name}</span>
            <span className="block text-caption text-ink-muted">{s.what}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// ─── The daily loop ──────────────────────────────────────────────────────────

const LOOP: readonly { icon: string; label: string }[] = [
  { icon: 'school', label: 'Learn a few' },
  { icon: 'reviews', label: 'Review when due' },
  { icon: 'local_fire_department', label: 'Keep the streak' },
]

export function LoopStep() {
  return (
    <ol className="flex items-stretch justify-between gap-1.5">
      {LOOP.map((l, i) => (
        <li key={l.label} className="flex flex-1 items-center gap-1.5">
          <span className="flex flex-1 flex-col items-center gap-1 rounded-md bg-surface px-2 py-3 text-center">
            <Icon name={l.icon} className="text-2xl text-primary" />
            <span className="text-caption font-semibold leading-tight text-ink">{l.label}</span>
          </span>
          {i < LOOP.length - 1 && <Icon name="arrow_forward" className="shrink-0 text-base text-ink-subtle" />}
        </li>
      ))}
    </ol>
  )
}
