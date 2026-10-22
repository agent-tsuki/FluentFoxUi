import type { CSSProperties } from 'react'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { formatCompactCount, formatVideoCount, safeAccentColor } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassChannelProfile } from '@/types/classes'
import { ChannelAvatar } from '../ChannelAvatar'
import { LINK_BUTTON } from '../linkStyles'
import { YouTubeLogo } from '../YouTubeLogo'
import { ChannelAssessment } from './ChannelAssessment'
import { SectionTitle } from './SectionTitle'

/**
 * ChannelIntroduction — the personalised channel profile: banner, picture,
 * name with the YouTube mark, subscribe/visit actions, intro video and the
 * editorial assessment. The channel's accent colour is exposed as
 * `--channel-accent` and used only for decoration (banner wash, avatar ring,
 * verdict rule), never for text, so contrast stays token-controlled.
 */
export function ChannelIntroduction({ channel }: { channel: ClassChannelProfile }) {
  const isYouTube = channel.platform === 'youtube'
  const accent = safeAccentColor(channel.accentColor) ?? 'rgb(var(--primary))'
  const style = { '--channel-accent': accent } as CSSProperties
  const facts = [
    channel.handle,
    channel.subscriberCount != null && `${formatCompactCount(channel.subscriberCount)} subscribers`,
    channel.videoCount != null && channel.videoCount > 0 && formatVideoCount(channel.videoCount),
  ].filter(Boolean)

  return (
    <section aria-labelledby="channel-title" style={style}>
      <SectionTitle id="channel-title" icon="person">{isYouTube ? 'Meet the channel' : 'About the provider'}</SectionTitle>

      <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-elevation-1">
        <div className="relative aspect-[4/1] w-full overflow-hidden bg-surface-container md:aspect-[6/1]">
          {channel.bannerUrl ? (
            <img src={channel.bannerUrl} alt="" width={1536} height={256} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 bg-[color:var(--channel-accent)] opacity-20" />
          )}
        </div>

        <div className="space-y-6 px-5 pb-6 md:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <ChannelAvatar
                name={channel.name}
                avatarUrl={channel.avatarUrl}
                size="xl"
                className="ring-4 ring-surface-container-lowest outline outline-2 outline-offset-4 outline-[color:var(--channel-accent)]"
              />
              <div className="min-w-0 pb-1">
                <h3 className="flex items-center gap-2 font-headline text-xl font-extrabold text-on-surface">
                  <span className="truncate">{channel.name}</span>
                  {isYouTube && <YouTubeLogo title="YouTube" className="h-5" />}
                </h3>
                {facts.length > 0 && <p className="text-sm text-on-surface-variant">{facts.join(' · ')}</p>}
              </div>
            </div>
            <ChannelActions channel={channel} />
          </div>

          {channel.description && <p className="max-w-prose text-sm leading-relaxed text-on-surface-variant md:text-base">{channel.description}</p>}

          {isYouTube && channel.introVideoId && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Channel introduction</p>
              <VideoEmbed youtubeId={channel.introVideoId} title={`${channel.name} — channel introduction`} />
            </div>
          )}

          <ChannelAssessment channel={channel} />
        </div>
      </div>
    </section>
  )
}

function ChannelActions({ channel }: { channel: ClassChannelProfile }) {
  const newTab = <span className="sr-only">(opens in a new tab)</span>
  if (channel.platform !== 'youtube') {
    const meta = PLATFORM_META[channel.platform]
    return (
      <a href={channel.url} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON.outline}>
        <Icon name={meta.icon} className="text-lg" />
        Visit {meta.label.toLowerCase()}
        {newTab}
      </a>
    )
  }
  const subscribeUrl = `${channel.url}${channel.url.includes('?') ? '&' : '?'}sub_confirmation=1`
  return (
    <div className="flex flex-wrap gap-2">
      <a href={subscribeUrl} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON.primary}>
        <YouTubeLogo />
        Subscribe
        {newTab}
      </a>
      <a href={channel.url} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON.outline}>
        <YouTubeLogo />
        Visit channel
        {newTab}
      </a>
    </div>
  )
}
