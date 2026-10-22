/** Display helpers for the admin screens. */
import { timeAgo } from '@/lib/profile/formatTime'
import type { PermissionGrant } from '@/types/admin'
import { PERMISSION_LABELS } from './permissions'

/** "3 hours ago", or "Never" when the item was never synced. */
export function syncedLabel(iso: string | null): string {
  return iso ? timeAgo(iso) : 'Never'
}

/** "12 Mar 2026, 14:05". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** "Edit courses · all channels" / "Publish · Japanese Ammo with Misa". */
export function describeGrant(grant: PermissionGrant, resourceName?: string | null): string {
  const label = PERMISSION_LABELS[grant.permission].label
  if (grant.resourceType === '') return `${label} · all channels`
  const kind = grant.resourceType === 'course' ? 'course' : 'channel'
  return `${label} · ${resourceName ?? `${kind} ${grant.resourceId.slice(0, 8)}`}`
}

/** Seconds → "12h 30m". */
export function formatDuration(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.round((totalSec % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
