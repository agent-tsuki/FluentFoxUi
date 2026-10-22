import { Icon } from '@/components/ui/Icon'
import { PERMISSION_LABELS } from '@/lib/admin/permissions'
import { formatDateTime } from '@/lib/admin/format'
import type { InvitePreview, InvitePreviewGrant } from '@/types/admin'

/** Channels (or "all channels") an invite covers, de-duplicated by name. */
function scopes(grants: InvitePreviewGrant[]): string[] {
  const names = grants.map(g => (g.resourceType === '' ? 'All channels' : g.resourceName ?? 'A channel that no longer exists'))
  return [...new Set(names)]
}

/** What an invite grants: channels, permissions, invited address and expiry. */
export function InviteSummary({ preview }: { preview: InvitePreview }) {
  const permissions = [...new Set(preview.grants.map(g => g.permission))]
  return (
    <dl className="space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-5 text-left">
      <div>
        <dt className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Channels</dt>
        <dd className="mt-1 space-y-0.5">
          {scopes(preview.grants).map(name => <p key={name} className="font-semibold text-on-surface">{name}</p>)}
        </dd>
      </div>
      <div>
        <dt className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">You&apos;ll be able to</dt>
        <dd className="mt-1">
          <ul className="space-y-1">
            {permissions.map(p => (
              <li key={p} className="flex items-start gap-2 text-sm text-on-surface">
                <Icon name="check" className="mt-px text-base text-success" />
                <span>{PERMISSION_LABELS[p].label} <span className="text-on-surface-variant">— {PERMISSION_LABELS[p].description.toLowerCase()}</span></span>
              </li>
            ))}
          </ul>
        </dd>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-on-surface-variant">Sent to</dt>
          <dd className="font-semibold text-on-surface">{preview.emailMasked}</dd>
        </div>
        <div>
          <dt className="text-xs text-on-surface-variant">Expires</dt>
          <dd className="font-semibold text-on-surface">{formatDateTime(preview.expiresAt)}</dd>
        </div>
      </div>
    </dl>
  )
}
