import { useCallback, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import type { JlptLevel } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { learnService } from '@/api/services/learnService'
import { profileService } from '@/api/services/profileService'
import { invalidateLearnSummary } from '@/hooks/useLearnSummary'
import { useTutorialStore } from '@/store/tutorialStore'
import { shouldShow } from '@/lib/tutorial/tutorialState'

/** `?tour=welcome` opens the tour on purpose (Settings → Replay, or to preview it). */
export const TOUR_PARAM = 'tour'
export const WELCOME_REPLAY_PATH = `/?${TOUR_PARAM}=welcome`

/** Where the tour may open: a calm landing page, never mid-lesson or on a deep link. */
function isTourRoute(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/dashboard')
}

/**
 * Whether the welcome tour is open, and how to close it. Loads the status
 * once per signed-in user. Only verified users get it: /profile/* needs a
 * verified email, so an unverified user's choice could not be saved.
 */
export function useWelcomeTour(): {
  open: boolean
  firstName: string | undefined
  finish: (status: 'skipped' | 'completed', step: number) => void
} {
  const { user } = useAuth()
  const { isOpen: authModalOpen } = useModal()
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const { userId, welcome, replaying, load, reset, record, replay } = useTutorialStore()
  const verifiedId = user?.emailVerified ? user.userId : null

  useEffect(() => {
    if (verifiedId) {
      if (verifiedId !== userId) void load(verifiedId)
    } else if (userId) {
      reset()
    }
  }, [verifiedId, userId, load, reset])

  const asked = params.get(TOUR_PARAM) === 'welcome'
  useEffect(() => {
    if (!asked || !verifiedId || verifiedId !== userId) return
    replay()
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(TOUR_PARAM)
      return next
    }, { replace: true })
  }, [asked, verifiedId, userId, replay, setParams])

  const open =
    Boolean(verifiedId) &&
    verifiedId === userId &&
    !authModalOpen &&
    isTourRoute(pathname) &&
    (replaying || shouldShow(welcome))

  return { open, firstName: user?.firstName, finish: record }
}

export interface WelcomeGoals {
  targetLevel: JlptLevel
  dailyGoal: number
}

/**
 * Saves the goals picked in the tour to the profile and learning settings.
 * The tour never waits on it or fails because of it: both stay editable in
 * Settings, so a failed save is ignored here.
 */
export function useSaveWelcomeGoals(): (goals: WelcomeGoals) => void {
  return useCallback((goals: WelcomeGoals) => {
    void Promise.allSettled([
      profileService.updateProfile({ targetLevel: goals.targetLevel }),
      learnService.updateSettings({ daily_goal_answers: goals.dailyGoal }).then(invalidateLearnSummary),
    ])
  }, [])
}
