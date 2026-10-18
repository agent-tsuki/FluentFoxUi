import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const ASKED_KEY_PREFIX = 'ff_location_asked:'

/**
 * After sign-in, asks the browser for this device's position so the device
 * list shows a precise location instead of the IP guess. Asked once per tab
 * session; if the user says no, the IP location stays and Account Settings
 * offers to try again.
 */
export function LoginLocationPrompt() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.emailVerified) return
    const key = ASKED_KEY_PREFIX + user.userId
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch { /* storage unavailable: asking again later is harmless */ }

    // Loaded on demand so guests never download it.
    void import('@/lib/profile/preciseLocation').then(async ({ locationPermission, shareCurrentLocation }) => {
      // Don't re-ask someone who blocked it; the settings page explains how to allow it.
      if ((await locationPermission()) === 'denied') return
      await shareCurrentLocation()
    })
  }, [user?.userId, user?.emailVerified])

  return null
}
