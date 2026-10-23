import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { ChannelOverrides, type ChannelOverrideActions } from '@/components/admin/channel/ChannelOverrides'
import { ChannelProfileForm } from '@/components/admin/channel/ChannelProfileForm'
import { ChannelStatusPanel } from '@/components/admin/channel/ChannelStatusPanel'
import { ChannelHistory } from '@/components/admin/channel/ChannelHistory'
import { useAdminChannel } from '@/hooks/admin/useAdminData'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { adminService } from '@/api/services/adminService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import type { AdminChannel, ChannelTextUpdate, PermissionResource } from '@/types/admin'

/** /admin/classes/channels/:id — edit a channel's profile, media, visibility and sync. */
export function ChannelEditorPage() {
  const { id = '' } = useParams()
  const { can } = usePermissions()
  const { data: channel, isLoading, error, refetch, setData } = useAdminChannel(id)
  const action = useAdminAction()
  const { run } = action
  const [historyVersion, setHistoryVersion] = useState(0)

  const resource: PermissionResource = useMemo(() => ({ type: 'channel', id }), [id])
  const canEditText = can('classes.channel.edit', resource)
  const canEditMedia = can('classes.channel.media', resource)
  const canPublish = can('classes.publish', resource)
  const canSync = can('classes.sync', resource)

  /** Runs a write that returns the updated channel, then shows it and reloads history. */
  const write = useCallback(
    async (key: string, call: () => Promise<AdminChannel>, notice: string) => {
      const result = await run(key, call, notice)
      if (!result.ok) return false
      setData(result.value)
      setHistoryVersion(v => v + 1)
      return true
    },
    [run, setData],
  )

  const actions: ChannelOverrideActions = useMemo(() => ({
    busy: action.busy,
    saveText: (field, value) => write(`text:${field}`, () => adminService.updateChannel(id, { [field]: value }), 'Saved.'),
    upload: (kind, file) => void write(`upload:${kind}`, () => adminService.uploadChannelImage(id, kind, file), 'Image uploaded.'),
    setIntroVideo: value => write('intro', () => adminService.setIntroVideo(id, value), 'Intro video updated.'),
    reset: field => void write(`reset:${field}`, () => adminService.resetChannelField(id, field), 'Reset to the YouTube value.'),
  }), [action.busy, write, id])

  const saveProfile = (patch: ChannelTextUpdate) => write('profile', () => adminService.updateChannel(id, patch), 'Profile saved.')

  // Optimistic: flip at once, roll back if the server refuses.
  const togglePublished = async (next: boolean) => {
    setData(c => ({ ...c, isPublished: next }))
    const ok = await write('publish', () => adminService.setChannelPublished(id, next), next ? 'Channel is live.' : 'Channel hidden.')
    if (!ok) setData(c => ({ ...c, isPublished: !next }))
  }

  if (isLoading) return <LoadingState label="Loading channel…" />
  if (error) {
    if (hasErrorCode(error, 'FORBIDDEN')) return <AdminForbidden message="You don't have access to this channel." />
    return <ErrorState message={resolveErrorMessage(error)} onRetry={refetch} />
  }
  if (!channel) return null

  const name = channel.fields.name.effective ?? channel.slug

  return (
    <div className="space-y-6">
      <AdminPageHeader title={name} description={channel.handle ?? channel.url} back={{ to: '/admin/my-channels', label: 'YouTube Channels' }} />
      <div aria-live="polite" className="space-y-2">
        <StatusMessage tone="error" message={action.error} />
        <StatusMessage tone="success" message={action.notice} />
      </div>
      <ChannelStatusPanel
        isPublished={channel.isPublished}
        lastSyncedAt={channel.lastSyncedAt}
        canPublish={canPublish}
        canSync={canSync}
        publishing={action.busy === 'publish'}
        syncing={action.busy === 'sync'}
        onTogglePublished={next => void togglePublished(next)}
        onSync={() => void write('sync', () => adminService.syncChannel(id), 'Synced from YouTube.')}
      />
      <AdminPanel title="Channel details">
        <ChannelOverrides channel={channel} canEditText={canEditText} canEditMedia={canEditMedia} actions={actions} />
      </AdminPanel>
      <AdminPanel title="Teacher profile">
        <ChannelProfileForm key={channel.id} channel={channel} canEdit={canEditText} saving={action.busy === 'profile'} onSave={saveProfile} />
      </AdminPanel>
      <AdminPanel title="Change history">
        <ChannelHistory channelId={id} version={historyVersion} />
      </AdminPanel>
    </div>
  )
}
