import { memo } from 'react'
import { Chip, type ChipTone } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { describeGrant, formatDateTime } from '@/lib/admin/format'
import type { InviteStatus, StaffInvite } from '@/types/admin'

const STATUS_TONE: Record<InviteStatus, ChipTone> = { pending: 'info', accepted: 'success', expired: 'warning', revoked: 'neutral' }

interface InviteItemProps {
  invite: StaffInvite
  channelNames: Map<string, string>
  busy: string | null
  onResend: (invite: StaffInvite) => void
  onRevoke: (invite: StaffInvite) => void
}

/** One invite: who, what, status, and Resend / Revoke while it can still be used. */
export const InviteItem = memo(function InviteItem({ invite, channelNames, busy, onResend, onRevoke }: InviteItemProps) {
  const open = invite.status === 'pending' || invite.status === 'expired'
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-all font-semibold text-on-surface">{invite.email}</span>
          <Chip tone={STATUS_TONE[invite.status]}>{invite.status}</Chip>
        </div>
        <ul className="text-xs text-on-surface-variant">
          {invite.grants.map(g => <li key={`${g.permission}:${g.resourceType}:${g.resourceId}`}>{describeGrant(g, channelNames.get(g.resourceId))}</li>)}
        </ul>
        <p className="text-xs text-on-surface-variant">
          {invite.status === 'accepted' && invite.acceptedAt ? `Accepted ${formatDateTime(invite.acceptedAt)}` : `Sent ${formatDateTime(invite.createdAt)} · expires ${formatDateTime(invite.expiresAt)}`}
        </p>
      </div>
      {open && (
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" className="min-h-11 px-4 py-2 text-sm" disabled={busy === `resend:${invite.id}`} onClick={() => onResend(invite)}>
            {busy === `resend:${invite.id}` ? 'Sending…' : 'Resend'}
          </Button>
          {invite.status === 'pending' && (
            <Button type="button" variant="ghost" className="min-h-11 px-4 py-2 text-sm text-error" disabled={busy === `revoke:${invite.id}`} onClick={() => onRevoke(invite)}>
              Revoke
            </Button>
          )}
        </div>
      )}
    </li>
  )
})
