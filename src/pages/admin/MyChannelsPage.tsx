import { Link, useNavigate } from 'react-router-dom'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ChannelCard } from '@/components/admin/channel/ChannelCard'
import { useAdminChannels } from '@/hooks/admin/useAdminData'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { resolveErrorMessage } from '@/api/errors'

/** /admin/my-channels — the YouTube channels this user may edit, plus "Add channel" for full-access admins. */
export function MyChannelsPage() {
  const navigate = useNavigate()
  const { data: channels, isLoading, error, refetch } = useAdminChannels()
  // Creating needs a global grant, as on the backend; a per-channel editor can't add new ones.
  const canCreate = usePermissions().can('classes.channel.edit')

  return (
    <>
      <AdminPageHeader
        title="YouTube Channels"
        description="Channels you can edit. Changes go live as soon as you save them."
        actions={canCreate && (
          <Link to="/admin/classes/channels/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary">
            <Icon name="add" className="text-base" /> Add channel
          </Link>
        )}
      />
      {isLoading ? (
        <LoadingState label="Loading channels…">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} className="h-24 rounded-2xl" />)}
          </div>
        </LoadingState>
      ) : error ? (
        <ErrorState message={resolveErrorMessage(error)} onRetry={refetch} />
      ) : !channels?.length ? (
        <EmptyState
          icon="smart_display"
          title="No channels yet"
          description={canCreate ? 'Add a YouTube channel to start curating its courses.' : "When you're given access to a channel, it shows up here."}
          actionLabel={canCreate ? 'Add channel' : undefined}
          onAction={canCreate ? () => navigate('/admin/classes/channels/new') : undefined}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {channels.map(channel => (
            <li key={channel.id}>
              <ChannelCard channel={channel} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
