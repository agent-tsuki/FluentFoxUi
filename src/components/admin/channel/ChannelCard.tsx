import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Chip } from '@/components/ui/Chip'
import { syncedLabel } from '@/lib/admin/format'
import type { AdminChannel } from '@/types/admin'

/** A channel the user can edit, linking to its editor. */
export const ChannelCard = memo(function ChannelCard({ channel }: { channel: AdminChannel }) {
  const name = channel.fields.name.effective ?? channel.slug
  const avatar = channel.fields.avatar_url.effective
  return (
    <Link
      to={`/admin/classes/channels/${channel.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-4 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {avatar ? (
        <img src={avatar} alt={`${name} profile picture`} width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-headline text-xl font-bold text-on-surface-variant">
          {name.charAt(0)}
        </span>
      )}
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block truncate font-headline text-base font-bold text-on-surface group-hover:text-primary">{name}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
          <Chip tone={channel.isPublished ? 'success' : 'neutral'}>{channel.isPublished ? 'Published' : 'Hidden'}</Chip>
          <span>Synced {syncedLabel(channel.lastSyncedAt).toLowerCase()}</span>
        </span>
      </span>
    </Link>
  )
})
