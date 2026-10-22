import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, SelectInput } from '@/components/ui/FormField'
import { ChannelSelect } from '@/components/admin/ChannelSelect'
import { PERMISSION_LABELS } from '@/lib/admin/permissions'
import type { AdminChannel, AdminPermission, NewGrantInput } from '@/types/admin'

/** Add one grant to a user: a permission, for all channels or one channel. */
interface GrantFormProps {
  userEmail: string
  channels: AdminChannel[]
  permissionOptions: AdminPermission[]
  allowAll: boolean
  saving: boolean
  onSubmit: (input: NewGrantInput) => void
}

export function GrantForm({ userEmail, channels, permissionOptions, allowAll, saving, onSubmit }: GrantFormProps) {
  const [permission, setPermission] = useState<AdminPermission>(permissionOptions[0] ?? 'classes.channel.edit')
  const [channelId, setChannelId] = useState('')
  const valid = channelId !== '' || allowAll

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onSubmit({ userEmail, permission, resourceType: channelId ? 'channel' : '', resourceId: channelId })
  }

  return (
    <form onSubmit={submit} className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
      <FormField label="Permission" htmlFor="grant-permission">
        <SelectInput id="grant-permission" value={permission} onChange={e => setPermission(e.target.value as AdminPermission)} disabled={saving}>
          {permissionOptions.map(p => <option key={p} value={p}>{PERMISSION_LABELS[p].label}</option>)}
        </SelectInput>
      </FormField>
      <FormField label="Scope" htmlFor="grant-scope">
        <ChannelSelect id="grant-scope" channels={channels} value={channelId} onChange={setChannelId} allowAll={allowAll} disabled={saving} />
      </FormField>
      <Button type="submit" className="min-h-11 px-5 py-2 text-sm" disabled={!valid || saving}>
        {saving ? 'Adding…' : 'Add grant'}
      </Button>
    </form>
  )
}
