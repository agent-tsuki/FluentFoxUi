import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FormField, TextInput } from '@/components/ui/FormField'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { GrantForm } from '@/components/admin/permissions/GrantForm'
import { useAdminChannels, useUserGrants } from '@/hooks/admin/useAdminData'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { adminService } from '@/api/services/adminService'
import { describeGrant, formatDateTime } from '@/lib/admin/format'
import { grantablePermissions } from '@/lib/admin/permissions'
import { resolveErrorMessage } from '@/api/errors'
import type { GrantRecord, NewGrantInput } from '@/types/admin'

/** /admin/permissions — look up a user by email and add or remove their grants. */
export function PermissionsPage() {
  const { permissions, can, canAny } = usePermissions()
  const [query, setQuery] = useState('')
  const [email, setEmail] = useState('')
  const grants = useUserGrants(email)
  const channels = useAdminChannels()
  const action = useAdminAction()
  const channelNames = useMemo(() => new Map((channels.data ?? []).map(c => [c.id, c.fields.name.effective ?? c.slug])), [channels.data])

  if (!canAny('permissions.manage')) return <AdminForbidden message="Only staff who manage permissions can open this page." />

  const search = (e: FormEvent) => {
    e.preventDefault()
    action.clear()
    setEmail(query.trim().toLowerCase())
  }

  const add = async (input: NewGrantInput) => {
    const result = await action.run('add', () => adminService.addGrant(input), 'Grant added.')
    if (result.ok) grants.refetch()
  }

  const remove = async (grant: GrantRecord) => {
    const result = await action.run(`remove:${grant.id}`, () => adminService.removeGrant(grant.id), 'Grant removed.')
    if (result.ok) grants.setData(list => list.filter(g => g.id !== grant.id))
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Permissions" description="Grant or remove access for one person. You can't change your own permissions." />
      <form onSubmit={search} role="search" className="flex flex-wrap items-end gap-3">
        <FormField label="User email" htmlFor="perm-email" className="min-w-0 flex-1">
          <TextInput id="perm-email" type="email" required value={query} onChange={e => setQuery(e.target.value)} placeholder="teacher@example.com" />
        </FormField>
        <Button type="submit" className="flex min-h-11 items-center gap-2 px-5 py-2 text-sm"><Icon name="search" className="text-base" /> Find</Button>
      </form>
      <div aria-live="polite">
        <StatusMessage tone="error" message={action.error} />
        <StatusMessage tone="success" message={action.notice} />
      </div>
      {email && (
        <AdminPanel title={`Grants for ${email}`}>
          {grants.isLoading ? (
            <LoadingState label="Loading grants…" />
          ) : grants.error ? (
            <ErrorState message={resolveErrorMessage(grants.error)} onRetry={grants.refetch} className="py-8" />
          ) : !grants.data?.length ? (
            <EmptyState icon="lock" title="No grants" description="This person has no admin access yet. Add a grant below." className="py-8" />
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {grants.data.map(g => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{describeGrant(g, channelNames.get(g.resourceId))}</p>
                    <p className="text-xs text-on-surface-variant">Granted {formatDateTime(g.createdAt)}</p>
                  </div>
                  <Button type="button" variant="ghost" className="min-h-11 shrink-0 px-4 py-2 text-sm text-error" disabled={action.busy === `remove:${g.id}`} onClick={() => void remove(g)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <GrantForm
            userEmail={email}
            channels={channels.data ?? []}
            permissionOptions={grantablePermissions(permissions)}
            allowAll={can('permissions.manage')}
            saving={action.busy === 'add'}
            onSubmit={input => void add(input)}
          />
        </AdminPanel>
      )}
    </div>
  )
}
