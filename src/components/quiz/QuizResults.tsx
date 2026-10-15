import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { AnimatePresence } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import partyConfettiUrl from '@/assets/lottie/party_confetti.lottie?url'
import type { QuizResultData, QuizQuestionData } from '@/types'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface QuizResultsProps {
  result: QuizResultData
  onRetry: () => void
  onExit: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function StarRating({ score, total }: { score: number; total: number }) {
  const pct = score / total
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1

  return (
    <div className="flex items-center gap-2 justify-center my-4">
      {[1, 2, 3].map((i) => (
        <Icon
          key={i}
          name="star"
          filled={i <= stars}
          className={`text-3xl transition-all duration-300 ${i <= stars ? 'text-primary' : 'text-on-surface-variant/30'}`}
        />
      ))}
    </div>
  )
}

function MissedCard({ q }: { q: QuizQuestionData }) {
  return (
    <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4 border border-outline-variant">
      <span
        className={`text-2xl font-black ${/[\u3040-\u30FF\u4E00-\u9FFF]/.test(q.prompt) ? 'japanese-text' : 'font-headline'} text-on-surface-variant`}
      >
        {q.prompt}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-on-surface-variant font-label truncate">{q.promptLabel}</p>
        <p className="text-sm font-bold text-on-surface font-label mt-0.5">{q.correctAnswer}</p>
      </div>
    </div>
  )
}

export function QuizResults({ result, onRetry, onExit }: QuizResultsProps) {
  const accuracy = Math.round((result.score / result.total) * 100)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (accuracy < 80 || reducedMotion) return

    // Initial burst
    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(200 * particleRatio) })

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2,  { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1,  { spread: 120, startVelocity: 45 })

    // A few extra cracker bursts from random positions — capped to a single
    // ~2.5s celebration window rather than running for as long as the modal
    // stays open.
    const intervalId = setInterval(() => {
      confetti({
        particleCount: 80,
        spread: 360,
        startVelocity: 30,
        decay: 0.88,
        scalar: 0.9,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ['#EA6B44', '#FFD700', '#FF69B4', '#00CED1', '#7B68EE', '#32CD32'],
      })
    }, 700)

    const stopTimeoutId = setTimeout(() => clearInterval(intervalId), 2500)

    return () => {
      clearTimeout(stopTimeoutId)
      clearInterval(intervalId)
      confetti.reset()
    }
  }, [accuracy, reducedMotion])

  const message =
    accuracy >= 90
      ? 'Outstanding! 素晴らしい！'
      : accuracy >= 70
      ? 'Great work! Keep it up.'
      : accuracy >= 50
      ? 'Good start. Practice makes perfect.'
      : 'Keep studying — you\'ll get there!'

  return (
    <>
    {/* Celebration layer — only when score ≥ 80% and motion isn't reduced.
        A single, non-looping Lottie burst instead of 5 concurrent looping
        instances (fireworks × 3 + balloons × 5). */}
    <AnimatePresence>
      {accuracy >= 80 && !reducedMotion && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {/* Party confetti Lottie — plays once, full screen top */}
          <DotLottieReact src={partyConfettiUrl} autoplay loop={false}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '60%', opacity: 0.7 }}
          />
        </div>
      )}
    </AnimatePresence>

    {/* Reduced-motion celebration — still celebratory via color/copy, no animation */}
    {accuracy >= 80 && reducedMotion && (
      <div className="fixed inset-0 z-40 pointer-events-none flex items-start justify-center pt-10">
        <div className="bg-primary text-on-primary font-bold font-label px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <Icon name="celebration" className="text-base" />
          Great job!
        </div>
      </div>
    )}

    {/* Backdrop */}
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/60 backdrop-blur-sm animate-results-enter">
      {/* Modal panel */}
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-elevation-3 overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <CloseButton onClick={onExit} />
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[85vh] px-6 pt-2 pb-6">
          {/* Score ring */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="rgb(var(--primary))" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 327} 327`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${accuracy === 100 ? 'text-3xl' : 'text-4xl'} font-black font-headline text-on-surface`}>{accuracy}%</span>
                <span className="text-xs font-label text-on-surface-variant">accuracy</span>
              </div>
            </div>

            <StarRating score={result.score} total={result.total} />
            <p className="text-base font-bold font-headline text-on-surface/80 text-center">{message}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Score', value: `${result.score}/${result.total}` },
              {
                label: 'Best Streak',
                value: (
                  <span className="inline-flex items-center justify-center gap-1">
                    {result.maxStreak}
                    <Icon name="local_fire_department" className="text-base text-primary" />
                  </span>
                ),
              },
              { label: 'Time', value: formatTime(result.timeElapsed) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant">
                <p className="text-xl font-black font-headline text-on-surface">{value}</p>
                <p className="text-2xs font-label text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Missed questions */}
          {result.missedQuestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant font-label mb-3">
                Review ({result.missedQuestions.length} missed)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.missedQuestions.map((q) => (
                  <MissedCard key={q.id} q={q} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-4 bg-primary hover:bg-primary/90 text-on-primary font-bold font-label rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 dark:shadow-primary/10"
            >
              Try Again
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold font-label rounded-xl border border-outline-variant transition-all active:scale-95"
            >
              New Session
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
