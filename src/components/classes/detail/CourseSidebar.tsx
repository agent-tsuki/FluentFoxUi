import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatCompactCount } from '@/lib/classes/format'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassChannelProfile } from '@/types/classes'
import { ChannelAvatar } from '../ChannelAvatar'
import { LINK_BUTTON } from '../linkStyles'
import { DETAIL_CARD } from './SectionTitle'

/**
 * CourseSidebar — the teacher at a glance and FoxSensei's one-line take, kept
 * in view beside the course content on large screens. On phones the full
 * "About the teacher" section below carries the same information, so this
 * column is not rendered there.
 */
export function CourseSidebar({ channel }: { channel: ClassChannelProfile }) {
  const meta = PLATFORM_META[channel.platform]
  const subtitle = [channel.handle, channel.subscriberCount != null && `${formatCompactCount(channel.subscriberCount)} subscribers`].filter(Boolean).join(' · ')
  const bestFor = channel.bestFor.slice(0, 3)

  return (
    <aside aria-label="Teacher" className="hidden space-y-5 lg:sticky lg:top-40 lg:block lg:self-start">
      <section aria-labelledby="sidebar-teacher" className={cn(DETAIL_CARD, 'space-y-4 p-5')}>
        <h2 id="sidebar-teacher" className="font-headline text-lg font-bold text-on-surface">Your teacher</h2>
        <div className="flex items-start gap-4">
          <ChannelAvatar name={channel.name} avatarUrl={channel.avatarUrl} size="lg" loading="eager" />
          <div className="min-w-0 space-y-0.5">
            <p className="font-semibold leading-snug text-on-surface">{channel.name}</p>
            {subtitle && <p className="break-words text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
        </div>
        {channel.description && <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">{channel.description}</p>}
        <a href={channel.url} target="_blank" rel="noopener noreferrer" className={cn(LINK_BUTTON.outline, 'w-full border-outline')}>
          Visit {channel.platform === 'youtube' ? 'YouTube channel' : meta.label}
          <Icon name="north_east" className="text-base" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </section>

      {(channel.verdict || bestFor.length > 0) && (
        <section aria-labelledby="sidebar-take" className={cn(DETAIL_CARD, 'space-y-3 p-5')}>
          <h2 id="sidebar-take" className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="verified" className="text-lg" />
            </span>
            FoxSensei's take
          </h2>
          {channel.verdict && <p className="text-sm font-semibold leading-relaxed text-on-surface">{channel.verdict}</p>}
          {bestFor.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Best for</p>
              <ul className="space-y-1.5">
                {bestFor.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <Icon name="check" className="mt-0.5 shrink-0 text-base text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </aside>
  )
}
