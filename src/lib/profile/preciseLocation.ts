/**
 * The browser's GPS position for this device's session. The API already has
 * an IP-based (approximate) location from login; this replaces it when the
 * user allows location access.
 */
import { profileService } from '@/api/services/profileService'

export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported'
export type ShareResult = 'saved' | 'denied' | 'unavailable' | 'error'

const POSITION_TIMEOUT_MS = 15_000
const POSITION_MAX_AGE_MS = 5 * 60_000
/** The API rejects larger radii; a fix that rough is no better than the IP location. */
const MAX_ACCURACY_M = 100_000

export async function locationPermission(): Promise<LocationPermission> {
  if (!('geolocation' in navigator)) return 'unsupported'
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  } catch {
    // Older Safari has no Permissions API for geolocation; asking will tell.
    return 'prompt'
  }
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: POSITION_TIMEOUT_MS,
      maximumAge: POSITION_MAX_AGE_MS,
    })
  })
}

/** Asks for the position (the browser prompts if needed) and saves it. */
export async function shareCurrentLocation(): Promise<ShareResult> {
  if (!('geolocation' in navigator)) return 'unavailable'
  let position: GeolocationPosition
  try {
    position = await currentPosition()
  } catch (err) {
    const code = (err as GeolocationPositionError).code
    return code === 1 /* PERMISSION_DENIED */ ? 'denied' : 'unavailable'
  }
  try {
    await profileService.updateCurrentLocation({
      latitude:  position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyM: Math.min(MAX_ACCURACY_M, Math.round(position.coords.accuracy)),
    })
    return 'saved'
  } catch {
    return 'error'
  }
}
