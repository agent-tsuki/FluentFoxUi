import { useCallback, useMemo } from 'react'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { InviteForm } from '@/components/admin/teachers/InviteForm'
import { InviteItem } from '@/components/admin/teachers/InviteList'
import { useAdminChannels, useInvites } from '@/hooks/admin/useAdminData'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { inviteService } from '@/api/services/inviteService'
import { grantablePermissions } from '@/lib/admin/permissions'
import { resolveErrorMessage } from '@/api/errors'
import type { NewInviteInput, StaffInvite } from '@/types/admin'

/** /admin/teachers — invite teachers and manage pending invites. */
export function TeachersPage() {
  const { permissions, can, canAny } = usePermissions()
  const invites = useInvites()
  const channels = useAdminChannels()
  const action = useAdminAction()
  const { run } = action
  const { setData } = invites

  const channelNames = useMemo(() => new Map((channels.data ?? []).map(c => [c.id, c.fields.name.effective ?? c.slug])), [channels.data])

  const send = async (input: NewInviteInput) => {
    const result = await run('send', () => inviteService.createInvite(input), `Invite sent to ${input.email.trim()}.`)
    if (result.ok) setData(list => [result.value, ...list])
    return result.ok
  }

  const onResend = useCallback(async (invite: StaffInvite) => {
    const result = await run(`resend:${invite.id}`, () => inviteService.resendInvite(invite.id), `New link sent to ${invite.email}.`)
    if (result.ok) setData(list => list.map(i => (i.id === invite.id ? result.value : i)))
  }, [run, setData])

  const onRevoke = useCallback(async (invite: StaffInvite) => {
    if (!window.confirm(`Revoke the invite for ${invite.email}? The link will stop working.`)) return
    const result = await run(`revoke:${invite.id}`, () => inviteService.revokeInvite(invite.id), 'Invite revoked.')
    if (result.ok) setData(list => list.map(i => (i.id === invite.id ? { ...i, status: 'revoked' } : i)))
  }, [run, setData])

  if (!canAny('permissions.manage')) return <AdminForbidden message="Only staff who manage permissions can invite teachers." />

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Teachers" description="Invite a teacher to edit a channel. The invite link works once and expires after 7 days." />
      <div aria-live="polite">
        <StatusMessage tone="error" message={action.error} />
        <StatusMessage tone="success" message={action.notice} />
      </div>
      <AdminPanel title="Invite a teacher">
        {channels.error ? (
          <ErrorState title="Channels unavailable" message={resolveErrorMessage(channels.error)} onRetry={channels.refetch} className="py-8" />
        ) : (
          <InviteForm
            channels={channels.data ?? []}
            permissionOptions={grantablePermissions(permissions)}
            allowAllChannels={can('permissions.manage')}
            sending={action.busy === 'send'}
            onSubmit={send}
          />
        )}
      </AdminPanel>
      <AdminPanel title="Invites">
        {invites.isLoading ? (
          <LoadingState label="Loading invites…" />
        ) : invites.error ? (
          <ErrorState message={resolveErrorMessage(invites.error)} onRetry={invites.refetch} className="py-8" />
        ) : !invites.data?.length ? (
          <EmptyState icon="mail" title="No invites yet" description="Invites you send appear here with their status." className="py-8" />
        ) : (
          <ul className="divide-y divide-outline-variant/40">
            {invites.data.map(invite => (
              <InviteItem key={invite.id} invite={invite} channelNames={channelNames} busy={action.busy} onResend={onResend} onRevoke={onRevoke} />
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  )
}
