import { useEffect } from 'react'
import { setPathUser } from '@/api/services/learningPathService'
import { useAuth } from '@/context/AuthContext'

/** Keeps the learning-path stores on the signed-in user (renders nothing). */
export function PathUserSync() {
  const { user, isLoading } = useAuth()
  const userId = user?.userId
  const verified = Boolean(user?.emailVerified)
  useEffect(() => {
    if (isLoading) return
    setPathUser(userId ? { userId, verified } : null)
  }, [isLoading, userId, verified])
  return null
}
