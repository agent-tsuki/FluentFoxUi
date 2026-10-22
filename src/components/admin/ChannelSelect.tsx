import { SelectInput } from '@/components/ui/FormField'
import type { AdminChannel } from '@/types/admin'

/**
 * Channel picker for grants and invites. `allowAll` adds an "All channels"
 * option (value ''), used for global grants.
 */
interface ChannelSelectProps {
  id: string
  channels: AdminChannel[]
  value: string
  onChange: (channelId: string) => void
  allowAll?: boolean
  disabled?: boolean
}

export function ChannelSelect({ id, channels, value, onChange, allowAll = false, disabled }: ChannelSelectProps) {
  return (
    <SelectInput id={id} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
      {allowAll ? <option value="">All channels</option> : <option value="" disabled>Choose a channel</option>}
      {channels.map(channel => (
        <option key={channel.id} value={channel.id}>
          {channel.fields.name.effective ?? channel.slug}
        </option>
      ))}
    </SelectInput>
  )
}
