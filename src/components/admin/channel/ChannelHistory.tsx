import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChannelHistory } from '@/hooks/admin/useAdminData'
import { formatDateTime } from '@/lib/admin/format'
import { timeAgo } from '@/lib/profile/formatTime'
import { resolveErrorMessage } from '@/api/errors'

const truncate = (value: string | null) => (value === null || value === '' ? '—' : value.length > 80 ? `${value.slice(0, 80)}…` : value)

/** Audit trail for one channel (every admin write is logged by the API). */
export function ChannelHistory({ channelId, version }: { channelId: string; version: number }) {
  const { data, isLoading, error, refetch } = useChannelHistory(channelId, version)

  if (isLoading) return <LoadingState label="Loading history…" />
  if (error) return <ErrorState title="History unavailable" message={resolveErrorMessage(error)} onRetry={refetch} className="py-8" />
  if (!data?.length) return <EmptyState icon="schedule" title="No changes yet" description="Edits, uploads and syncs appear here." className="py-8" />

  return (
    <ol className="divide-y divide-outline-variant/40">
      {data.map(entry => (
        <li key={entry.id} className="space-y-1 py-3">
          <p className="text-sm text-on-surface">
            <span className="font-semibold">{entry.actorName ?? 'Someone'}</span> changed <span className="font-semibold">{entry.field.replace(/_/g, ' ')}</span>
          </p>
          <p className="break-words text-xs text-on-surface-variant">
            {truncate(entry.oldValue)} → {truncate(entry.newValue)}
          </p>
          <time dateTime={entry.createdAt} title={formatDateTime(entry.createdAt)} className="block text-xs text-on-surface-variant">
            {timeAgo(entry.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  )
}
