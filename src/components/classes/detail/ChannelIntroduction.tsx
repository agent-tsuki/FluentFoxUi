import { useState } from 'react'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatCompactCount, formatVideoCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassChannelProfile } from '@/types/classes'
import { ChannelAvatar } from '../ChannelAvatar'
import { LINK_BUTTON } from '../linkStyles'
import { YouTubeLogo } from '../YouTubeLogo'
import { ChannelAssessment } from './ChannelAssessment'
import { SectionTitle } from './SectionTitle'

interface ChannelIntroductionProps {
  channel: ClassChannelProfile
  /** The course summary, so the assessment can skip a teaching style that repeats it. */
  courseSummary?: string
}

/**
 * ChannelIntroduction — the channel profile: banner strip, picture, name with
 * the YouTube mark, subscribe/visit actions, intro video and the editorial
 * assessment.
 *
 * Banner strip: the channel's YouTube banner; if there is none (or it fails to
 * load) a blurred, enlarged copy of the avatar; with neither, no strip at all
 * and the avatar row does not overlap anything.
 */
export function ChannelIntroduction({ channel, courseSummary }: ChannelIntroductionProps) {
  const isYouTube = channel.platform === 'youtube'
  const [bannerFailed, setBannerFailed] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const banner = channel.bannerUrl && !bannerFailed ? channel.bannerUrl : null
  const blurredAvatar = !banner && channel.avatarUrl && !avatarFailed ? channel.avatarUrl : null
  const hasStrip = Boolean(banner || blurredAvatar)
  const showIntro = isYouTube && Boolean(channel.introVideoId)

  const facts = [
    channel.handle,
    channel.subscriberCount != null && `${formatCompactCount(channel.subscriberCount)} subscribers`,
    channel.videoCount != null && channel.videoCount > 0 && formatVideoCount(channel.videoCount),
  ].filter(Boolean)

  return (
    <section aria-labelledby="channel-title">
      <SectionTitle id="channel-title" icon="person">{isYouTube ? 'Meet the channel' : 'About the provider'}</SectionTitle>

      <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
        {hasStrip && (
          <div className="relative aspect-[4/1] w-full overflow-hidden bg-surface-container md:aspect-[6/1]">
            {banner ? (
              <img
                src={banner}
                alt=""
                width={2120}
                height={351}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setBannerFailed(true)}
                className="absolute inset-0 size-full object-cover object-center"
              />
            ) : (
              blurredAvatar && (
                <>
                  <img
                    src={blurredAvatar}
                    alt=""
                    width={240}
                    height={240}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="absolute inset-0 size-full scale-150 object-cover blur-2xl"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-surface-inverse/20" />
                </>
              )
            )}
          </div>
        )}

        <div className={cn('space-y-6 px-5 pb-6 md:px-8', !hasStrip && 'pt-5')}>
          {/* relative z-10: the strip is positioned, so without this it paints over the avatar. */}
          <div className={cn('relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', hasStrip && '-mt-10 md:-mt-12')}>
            <div className="flex min-w-0 items-start gap-4">
              <ChannelAvatar name={channel.name} avatarUrl={channel.avatarUrl} size="profile" loading="eager" className="ring-4 ring-surface-container-lowest" />
              {/* With a strip, the text starts below its bottom edge instead of over the image. */}
              <div className={cn('min-w-0', hasStrip ? 'pt-11 md:pt-14' : 'self-center')}>
                <h3 className="font-headline text-lg font-extrabold text-on-surface md:text-xl">
                  <span className="line-clamp-2">
                    {channel.name}
                    {isYouTube && <YouTubeLogo title="YouTube" className="ml-2 h-4 align-[-0.125em] md:h-5" />}
                  </span>
                </h3>
                {facts.length > 0 && <p className="break-words text-sm text-on-surface-variant">{facts.join(' · ')}</p>}
              </div>
            </div>
            <ChannelActions channel={channel} />
          </div>

          {(channel.description || showIntro) && (
            <div className={cn('grid gap-6', showIntro && channel.description && 'md:grid-cols-[minmax(0,1fr)_18rem]')}>
              {channel.description && <p className="max-w-prose text-sm leading-relaxed text-on-surface-variant md:text-base">{channel.description}</p>}
              {showIntro && channel.introVideoId && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Channel introduction</p>
                  <VideoEmbed youtubeId={channel.introVideoId} title={`${channel.name} — channel introduction`} />
                </div>
              )}
            </div>
          )}

          <ChannelAssessment channel={channel} courseSummary={courseSummary} />
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
      <a href={channel.url} target="_blank" rel="noopener noreferrer" className={cn(LINK_BUTTON.outline, 'w-fit shrink-0')}>
        <Icon name={meta.icon} className="text-lg" />
        Visit {meta.label.toLowerCase()}
        {newTab}
      </a>
    )
  }
  const subscribeUrl = `${channel.url}${channel.url.includes('?') ? '&' : '?'}sub_confirmation=1`
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
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
