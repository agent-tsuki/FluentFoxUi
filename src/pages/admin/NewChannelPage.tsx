import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import { useAdminAction } from '@/hooks/admin/useAdminAction'
import { usePermissions } from '@/hooks/admin/usePermissions'
import { adminService } from '@/api/services/adminService'
import { parseYouTubeChannel, slugify } from '@/lib/admin/youtubeChannel'

const CHANNELS_BACK = { to: '/admin/my-channels', label: 'YouTube Channels' }

/**
 * /admin/classes/channels/new — add a YouTube channel. It starts hidden; the
 * editor opens next so it can be synced from YouTube, filled in and published.
 */
export function NewChannelPage() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const action = useAdminAction()
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // The backend only lets a global channel.edit grant (or a super admin) create channels.
  if (!can('classes.channel.edit')) return <AdminForbidden message="Only admins with full channel access can add channels." />

  const channel = parseYouTubeChannel(link)
  const effectiveSlug = slugEdited ? slug : slugify(name)
  const linkError = submitted && !channel ? 'Paste a channel link such as https://www.youtube.com/@ToKiniAndy, or just the @handle.' : ''
  const slugError = submitted && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(effectiveSlug) ? 'Use lowercase letters, numbers and single dashes.' : ''
  const nameError = submitted && !name.trim() ? 'Enter the channel name.' : ''

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!channel || !name.trim() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(effectiveSlug)) return
    const result = await action.run('create', () =>
      adminService.createChannel({
        name: name.trim(),
        slug: effectiveSlug,
        url: channel.url,
        handle: channel.handle,
        youtubeChannelId: channel.channelId,
      }),
    )
    if (result.ok) navigate(`/admin/classes/channels/${result.value.id}`, { replace: true })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add a YouTube channel"
        description="The channel starts hidden. Next, sync it from YouTube to pull in the picture, banner and stats, then publish it when it's ready."
        back={CHANNELS_BACK}
      />
      <div aria-live="polite">
        <StatusMessage tone="error" message={action.error} />
      </div>
      <form noValidate onSubmit={e => void onSubmit(e)} className="max-w-2xl space-y-5 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-5 sm:p-6">
        <FormField label="YouTube channel link" htmlFor="channel-link" hint={linkError || 'A link to the channel, not to a video or playlist.'}>
          <TextInput
            id="channel-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://www.youtube.com/@ToKiniAndy"
            value={link}
            onChange={e => setLink(e.target.value)}
            aria-invalid={!!linkError}
            required
          />
        </FormField>

        <FormField label="Channel name" htmlFor="channel-name" hint={nameError || 'Shown on course cards. Syncing from YouTube will not overwrite it.'}>
          <TextInput id="channel-name" value={name} maxLength={120} onChange={e => setName(e.target.value)} aria-invalid={!!nameError} required />
        </FormField>

        <FormField label="Slug" htmlFor="channel-slug" hint={slugError || 'Used inside FoxSensei to identify the channel. It cannot be changed later.'}>
          <TextInput
            id="channel-slug"
            value={effectiveSlug}
            maxLength={80}
            onChange={e => { setSlugEdited(true); setSlug(e.target.value.toLowerCase()) }}
            aria-invalid={!!slugError}
            required
          />
        </FormField>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={action.busy === 'create'} className="flex min-h-11 items-center gap-2 text-sm">
            <Icon name={action.busy === 'create' ? 'progress_activity' : 'add'} className={action.busy === 'create' ? 'animate-spin text-base' : 'text-base'} />
            Add channel
          </Button>
        </div>
      </form>
    </div>
  )
}
