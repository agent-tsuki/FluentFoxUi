import { lazy, Suspense } from 'react'
import { useWelcomeTour } from '@/hooks/useWelcomeTour'

const WelcomeTour = lazy(() => import('./WelcomeTour'))

/**
 * Mounted once in the app shell. Opens the welcome tour for a verified
 * learner who has not skipped or finished it, on Home or the Dashboard.
 * Renders nothing otherwise, and the tour chunk is only fetched when needed.
 */
export function TutorialGate() {
  const { open, firstName, finish } = useWelcomeTour()
  if (!open) return null
  return (
    <Suspense fallback={null}>
      <WelcomeTour firstName={firstName} onFinish={finish} />
    </Suspense>
  )
}
