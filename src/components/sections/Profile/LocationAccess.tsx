import { useEffect, useState } from 'react'
import { locationPermission, shareCurrentLocation, type LocationPermission } from '@/lib/profile/preciseLocation'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const RESULT_MESSAGES = {
  saved:       'Precise location saved for this device.',
  denied:      'Location is blocked for this site. Allow it in your browser’s site settings, then try again.',
  unavailable: 'Your device couldn’t find its position. We’ll keep using the approximate location.',
  error:       'We couldn’t save your location. Please try again.',
} as const

const STATUS_TEXT: Record<LocationPermission, string> = {
  granted:     'Precise (GPS) location is on for this device.',
  prompt:      'This device uses an approximate location from its IP address.',
  denied:      'Location is blocked, so this device uses an approximate location from its IP address.',
  unsupported: 'This browser can’t share a precise location; we use an approximate one from its IP address.',
}

/** Lets the user switch this device from IP-based to GPS location. */
export function LocationAccess({ onSaved }: { onSaved: () => void }) {
  const [permission, setPermission] = useState<LocationPermission | null>(null)
  const [busy, setBusy]             = useState(false)
  const [result, setResult]         = useState<keyof typeof RESULT_MESSAGES | null>(null)

  useEffect(() => { void locationPermission().then(setPermission) }, [])

  const share = async () => {
    setBusy(true)
    const outcome = await shareCurrentLocation()
    setResult(outcome)
    setPermission(await locationPermission())
    setBusy(false)
    if (outcome === 'saved') onSaved()
  }

  if (permission === null) return null

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap rounded-xl bg-surface-container px-4 py-3">
      <div className="flex items-start gap-3">
        <Icon name="location_on" className="text-xl text-primary shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-on-surface">Login location</p>
          <p className="text-xs text-on-surface-variant">{STATUS_TEXT[permission]}</p>
          {result && <p role="status" className="text-xs text-on-surface">{RESULT_MESSAGES[result]}</p>}
        </div>
      </div>
      {permission !== 'unsupported' && (
        <Button variant="outline" className="text-sm px-4 py-2" onClick={share} disabled={busy}>
          {busy ? 'Locating…' : permission === 'granted' ? 'Update location' : 'Use precise location'}
        </Button>
      )}
    </div>
  )
}
