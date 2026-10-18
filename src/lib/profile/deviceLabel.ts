import type { DeviceSession } from '@/types'
import { placeLabel } from '@/lib/profile/countries'

const DEVICE_ICONS: Record<DeviceSession['deviceType'], string> = {
  desktop: 'computer',
  mobile:  'smartphone',
  tablet:  'tablet',
  unknown: 'device_unknown',
}

export function deviceIcon(session: DeviceSession): string {
  return DEVICE_ICONS[session.deviceType]
}

/** "Chrome on Windows". */
export function deviceName(session: DeviceSession): string {
  return `${session.browser} on ${session.os}`
}

/** "Tokyo, Japan", or '' when the place is unknown. */
export function devicePlace(session: DeviceSession): string {
  return placeLabel(session.location.city, session.location.countryCode)
}
