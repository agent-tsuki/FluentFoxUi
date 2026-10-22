import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ChannelCard } from '@/components/admin/channel/ChannelCard'
import { useAdminChannels } from '@/hooks/admin/useAdminData'
import { resolveErrorMessage } from '@/api/errors'

/** /admin/my-channels — the channels this user may edit. */
export function MyChannelsPage() {
  const { data: channels, isLoading, error, refetch } = useAdminChannels()

  return (
    <>
      <AdminPageHeader title="My channels" description="Channels you can edit. Changes go live as soon as you save them." />
      {isLoading ? (
        <LoadingState label="Loading channels…">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} className="h-24 rounded-2xl" />)}
          </div>
        </LoadingState>
      ) : error ? (
        <ErrorState message={resolveErrorMessage(error)} onRetry={refetch} />
      ) : !channels?.length ? (
        <EmptyState icon="smart_display" title="No channels yet" description="When you're given access to a channel, it shows up here." />
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
