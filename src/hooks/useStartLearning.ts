import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'

/**
 * Shared behaviour for the homepage "Start free" / "Log in" calls to action.
 * Signed-in learners go straight to their dashboard instead of seeing the
 * auth popup again. `prefetch` warms the popup chunk on hover/focus/touch.
 */
export function useStartLearning() {
  const { user } = useAuth()
  const { openModal } = useModal()
  const navigate = useNavigate()

  const startLearning = useCallback(() => {
    if (user) navigate('/dashboard')
    else openModal('signup')
  }, [user, navigate, openModal])

  const logIn = useCallback(() => {
    if (user) navigate('/dashboard')
    else openModal('login')
  }, [user, navigate, openModal])

  return { isSignedIn: user !== null, startLearning, logIn, prefetch: authModalPrefetchHandlers }
}
