import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'
import { ChannelSelect } from '@/components/admin/ChannelSelect'
import { PermissionCheckboxes } from '@/components/admin/PermissionCheckboxes'
import type { AdminChannel, AdminPermission, NewInviteInput } from '@/types/admin'

const DEFAULT_PERMISSIONS: AdminPermission[] = ['classes.channel.edit', 'classes.channel.media', 'classes.course.edit']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Invite a teacher by email to one channel (or all, when allowed) with chosen permissions. */
interface InviteFormProps {
  channels: AdminChannel[]
  permissionOptions: AdminPermission[]
  allowAllChannels: boolean
  sending: boolean
  /** Resolves true when sent, so the form can clear. */
  onSubmit: (input: NewInviteInput) => Promise<boolean>
}

export function InviteForm({ channels, permissionOptions, allowAllChannels, sending, onSubmit }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [channelId, setChannelId] = useState('')
  const [permissions, setPermissions] = useState<AdminPermission[]>(DEFAULT_PERMISSIONS)
  const valid = EMAIL.test(email.trim()) && permissions.length > 0 && (channelId !== '' || allowAllChannels)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const grants = permissions.map(permission =>
      channelId ? { permission, resourceType: 'channel' as const, resourceId: channelId } : { permission, resourceType: '' as const, resourceId: '' },
    )
    if (await onSubmit({ email, grants })) {
      setEmail('')
      setPermissions(DEFAULT_PERMISSIONS)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={sending} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Teacher's email" htmlFor="inv-email" hint="They must sign in with this address to accept.">
            <TextInput id="inv-email" type="email" autoComplete="off" required value={email} onChange={e => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Channel" htmlFor="inv-channel">
            <ChannelSelect id="inv-channel" channels={channels} value={channelId} onChange={setChannelId} allowAll={allowAllChannels} />
          </FormField>
        </div>
        <PermissionCheckboxes options={permissionOptions} selected={permissions} onChange={setPermissions} />
      </fieldset>
      <Button type="submit" className="min-h-11 px-6 py-2 text-sm" disabled={!valid || sending}>
        {sending ? 'Sending…' : 'Send invite'}
      </Button>
    </form>
  )
}
