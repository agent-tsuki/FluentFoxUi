import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSaveWelcomeGoals, type WelcomeGoals } from '@/hooks/useWelcomeTour'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { lessonPath } from '@/lib/learn/paths'
import { cn } from '@/lib/cn'
import { Spotlight } from './Spotlight'
import { FirstKanaStep, Fox, GoalStep, LoopStep, NavStep } from './steps'

type StepId = 'welcome' | 'goal' | 'kana' | 'nav' | 'loop' | 'done'

interface StepDef {
  id: StepId
  /** `data-tour` element to highlight; the card is centred without one. */
  target?: string
  eyebrow: string
  title: (name: string | undefined) => string
  body: string
}

const STEPS: readonly StepDef[] = [
  {
    id: 'welcome',
    eyebrow: 'Welcome to FoxSensei',
    title: (name) => (name ? `Hi ${name}, I'm your sensei` : "Hi, I'm your sensei"),
    body: "In one minute you'll set a goal, learn your first character and know where everything is.",
  },
  { id: 'goal', eyebrow: 'Your goal', title: () => 'What are you aiming for?', body: 'This shapes what we suggest and how much you see each day.' },
  { id: 'kana', eyebrow: 'Your first kana', title: () => 'Meet あ', body: 'Every Japanese word is built from kana. This is the first one.' },
  { id: 'nav', target: 'nav', eyebrow: 'Find your way', title: () => 'Everything lives up here', body: 'Start with Kana. The rest opens up as you go.' },
  { id: 'loop', target: 'streak', eyebrow: 'The daily loop', title: () => 'A little every day wins', body: 'Reviews arrive just before you would forget. Clear them and your streak grows.' },
  { id: 'done', eyebrow: "You're ready", title: () => 'あ is yours. Next: the あ row', body: 'Five kana, about five minutes. Your first reviews come tomorrow.' },
]

const LAST = STEPS.length - 1
const DEFAULT_GOALS: WelcomeGoals = { targetLevel: 'N5', dailyGoal: 20 }

async function celebrate() {
  const { default: confetti } = await import('canvas-confetti')
  void confetti({ particleCount: 90, spread: 70, startVelocity: 38, origin: { y: 0.55 }, disableForReducedMotion: true })
}

interface WelcomeTourProps {
  firstName: string | undefined
  onFinish: (status: 'skipped' | 'completed', step: number) => void
}

/**
 * The first-visit welcome tour: six short steps with a Skip on every one.
 * Escape skips, arrow keys move, focus stays inside the card. Lazy-loaded by
 * TutorialGate, so learners who are done never download it.
 */
export default function WelcomeTour({ firstName, onFinish }: WelcomeTourProps) {
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const saveGoals = useSaveWelcomeGoals()
  const [index, setIndex] = useState(0)
  const [goals, setGoals] = useState<WelcomeGoals>(DEFAULT_GOALS)
  const [kanaWon, setKanaWon] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const step = STEPS[index]

  // Keep the page still behind the overlay.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Each step's heading takes focus, so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus()
    if (step.id === 'done' && !reducedMotion) void celebrate()
  }, [step.id, reducedMotion])

  const skip = useCallback(() => onFinish('skipped', index), [onFinish, index])
  const complete = useCallback(() => onFinish('completed', LAST), [onFinish])

  const next = useCallback(() => {
    if (step.id === 'goal') saveGoals(goals)
    setIndex((i) => Math.min(i + 1, LAST))
  }, [step.id, goals, saveGoals])
  const back = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  const startLesson = () => {
    complete()
    navigate(lessonPath('hiragana'))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      skip()
      return
    }
    // Arrows move between steps, but not while they move between radio options.
    const inGroup = (e.target as HTMLElement).closest('[role="radiogroup"],[role="group"]')
    if (!inGroup && e.key === 'ArrowRight' && index < LAST) next()
    if (!inGroup && e.key === 'ArrowLeft' && index > 0) back()
    if (e.key === 'Tab') trapFocus(e, cardRef.current)
  }

  const motionProps = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }

  return (
    <Spotlight target={step.target} reducedMotion={reducedMotion}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        onKeyDown={onKeyDown}
        className="rounded-xl border border-line bg-surface-raised p-5 text-ink shadow-elevation-3 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <ProgressDots index={index} />
          {index < LAST && (
            <button
              type="button"
              onClick={skip}
              className="-mr-2 min-h-touch-target rounded-md px-3 text-label font-semibold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Skip tour
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step.id} {...motionProps} transition={{ duration: reducedMotion ? 0.12 : 0.22, ease: 'easeOut' }}>
            {(step.id === 'welcome' || step.id === 'done') && <Fox />}
            <p className="text-caption font-semibold uppercase tracking-[0.12em] text-primary">{step.eyebrow}</p>
            <h2 id="tour-title" ref={headingRef} tabIndex={-1} className="mt-1 font-display text-h3 font-bold text-ink focus:outline-none">
              {step.title(firstName)}
            </h2>
            <p id="tour-body" className="mt-1.5 text-body text-ink-muted">{step.body}</p>
            <StepBody id={step.id}>
              {step.id === 'goal' && <GoalStep goals={goals} onChange={setGoals} />}
              {step.id === 'kana' && <FirstKanaStep won={kanaWon} onWin={() => setKanaWon(true)} reducedMotion={reducedMotion} />}
              {step.id === 'nav' && <NavStep />}
              {step.id === 'loop' && <LoopStep />}
            </StepBody>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-2">
          {index > 0 && index < LAST ? (
            <Button variant="ghost" onClick={back} className="-ml-2">
              <Icon name="arrow_back" className="text-lg" /> Back
            </Button>
          ) : (
            <span />
          )}
          {index < LAST ? (
            <Button variant={step.id === 'kana' && !kanaWon ? 'secondary' : 'primary'} onClick={next} className="rounded-full px-6">
              {index === 0 ? "Let's go" : step.id === 'kana' && !kanaWon ? 'Skip this' : 'Next'}
              <Icon name="arrow_forward" className="text-lg" />
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button onClick={startLesson} className="flex w-full rounded-full">
                <Icon name="play_circle" className="text-lg" /> Start the あ row
              </Button>
              <Button variant="ghost" onClick={complete} className="flex w-full">Explore on my own</Button>
            </div>
          )}
        </div>
        {index === LAST && <p className="mt-3 text-center text-caption text-ink-subtle">Replay this tour anytime from Settings.</p>}
      </div>
    </Spotlight>
  )
}

function StepBody({ id, children }: { id: StepId; children: ReactNode }) {
  if (id === 'welcome' || id === 'done') return null
  return <div className="mt-4">{children}</div>
}

function ProgressDots({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">{`Step ${index + 1} of ${STEPS.length}`}</span>
      {STEPS.map((s, i) => (
        <span
          key={s.id}
          aria-hidden
          className={cn('h-1.5 rounded-full transition-all duration-300', i === index ? 'w-6 bg-primary' : i < index ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-line-strong')}
        />
      ))}
    </div>
  )
}

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (e.shiftKey && (active === first || !container.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}
