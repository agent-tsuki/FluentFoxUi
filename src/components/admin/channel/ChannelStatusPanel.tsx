import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Switch } from '@/components/ui/Switch'
import { formatDateTime, syncedLabel } from '@/lib/admin/format'

/** Published toggle + last-synced time + "Sync now", each shown only with its permission. */
interface ChannelStatusPanelProps {
  isPublished: boolean
  lastSyncedAt: string | null
  canPublish: boolean
  canSync: boolean
  publishing: boolean
  syncing: boolean
  onTogglePublished: (next: boolean) => void
  onSync: () => void
}

export function ChannelStatusPanel(props: ChannelStatusPanelProps) {
  const { isPublished, lastSyncedAt, canPublish, canSync, publishing, syncing, onTogglePublished, onSync } = props
  return (
    <section aria-label="Channel status" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-4 sm:p-5">
      <div className="space-y-0.5">
        {canPublish ? (
          <Switch checked={isPublished} onChange={onTogglePublished} busy={publishing} label={isPublished ? 'Published' : 'Hidden from learners'} />
        ) : (
          <p className="text-sm font-medium text-on-surface">{isPublished ? 'Published' : 'Hidden from learners'}</p>
        )}
        <p className="text-xs text-on-surface-variant">
          Last synced{' '}
          {lastSyncedAt ? <time dateTime={lastSyncedAt} title={formatDateTime(lastSyncedAt)}>{syncedLabel(lastSyncedAt)}</time> : 'never'}
        </p>
      </div>
      {canSync && (
        <Button type="button" variant="outline" className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm" disabled={syncing} onClick={onSync}>
          <Icon name={syncing ? 'progress_activity' : 'refresh'} className={syncing ? 'animate-spin text-base' : 'text-base'} />
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      )}
    </section>
  )
}
