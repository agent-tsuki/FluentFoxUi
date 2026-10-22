import { OverrideFieldRow } from './OverrideFieldRow'
import { ImageUploadButton, InlineTextEditor } from './OverrideEditors'
import type { AdminChannel, ChannelOverrideField } from '@/types/admin'

/** Callbacks resolve true on success (so inline editors can close). */
export interface ChannelOverrideActions {
  busy: string | null
  saveText: (field: 'name' | 'description', value: string) => Promise<boolean>
  upload: (kind: 'avatar' | 'banner', file: File) => void
  setIntroVideo: (value: string) => Promise<boolean>
  reset: (field: ChannelOverrideField) => void
}

interface ChannelOverridesProps {
  channel: AdminChannel
  canEditText: boolean
  canEditMedia: boolean
  actions: ChannelOverrideActions
}

const muted = 'text-sm text-on-surface-variant'

/** The five display fields with a YouTube value and an optional custom override. */
export function ChannelOverrides({ channel, canEditText, canEditMedia, actions }: ChannelOverridesProps) {
  const { name, avatar_url: avatar, banner_url: banner, description, intro_video_id: intro } = channel.fields
  const { busy } = actions
  const resetProps = (field: ChannelOverrideField) => ({ resetting: busy === `reset:${field}`, onReset: () => actions.reset(field) })

  return (
    <div>
      <OverrideFieldRow label="Name" value={name} canEdit={canEditText} {...resetProps('name')}
        preview={<p className="font-headline text-lg font-bold text-on-surface">{name.effective ?? <span className={muted}>Not set</span>}</p>}>
        <InlineTextEditor label="Channel name" initial={name.effective ?? ''} busy={busy === 'text:name'} onSave={v => actions.saveText('name', v)} />
      </OverrideFieldRow>

      <OverrideFieldRow label="Profile picture" value={avatar} canEdit={canEditMedia} {...resetProps('avatar_url')}
        preview={avatar.effective
          ? <img src={avatar.effective} alt={`${name.effective ?? 'Channel'} profile picture`} width={80} height={80} loading="lazy" className="h-20 w-20 rounded-full object-cover" />
          : <p className={muted}>No picture</p>}>
        <ImageUploadButton label="Picture" hasCustom={avatar.custom !== null} busy={busy === 'upload:avatar'} onFile={f => actions.upload('avatar', f)} />
      </OverrideFieldRow>

      <OverrideFieldRow label="Banner" value={banner} canEdit={canEditMedia} {...resetProps('banner_url')}
        preview={banner.effective
          ? <img src={banner.effective} alt={`${name.effective ?? 'Channel'} banner`} width={640} height={106} loading="lazy" className="aspect-[6/1] w-full max-w-xl rounded-xl object-cover" />
          : <p className={muted}>No banner</p>}>
        <ImageUploadButton label="Banner" hasCustom={banner.custom !== null} busy={busy === 'upload:banner'} onFile={f => actions.upload('banner', f)} />
      </OverrideFieldRow>

      <OverrideFieldRow label="Description" value={description} canEdit={canEditText} {...resetProps('description')}
        preview={<p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-on-surface">{description.effective || <span className={muted}>No description</span>}</p>}>
        <InlineTextEditor label="Channel description" multiline initial={description.effective ?? ''} busy={busy === 'text:description'} onSave={v => actions.saveText('description', v)} />
      </OverrideFieldRow>

      <OverrideFieldRow label="Intro video" value={intro} canEdit={canEditMedia} {...resetProps('intro_video_id')}
        preview={intro.effective
          ? <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(intro.effective)}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">youtu.be/{intro.effective}</a>
          : <p className={muted}>No intro video</p>}>
        <InlineTextEditor label="Intro video ID or YouTube link" placeholder="https://www.youtube.com/watch?v=…" initial={intro.effective ?? ''} busy={busy === 'intro'} onSave={actions.setIntroVideo} />
      </OverrideFieldRow>
    </div>
  )
}
