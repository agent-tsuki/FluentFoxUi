import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { ClassChannelProfile } from '@/types/classes'

type Tone = 'good' | 'bad'

const TONE: Record<Tone, { icon: string; color: string }> = {
  good: { icon: 'check', color: 'text-success' },
  bad:  { icon: 'close', color: 'text-error' },
}

function PointList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  if (items.length === 0) return null
  const t = TONE[tone]
  return (
    <div className="space-y-2.5">
      <h4 className={cn('text-xs font-bold uppercase tracking-[0.18em]', t.color)}>{title}</h4>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-on-surface-variant">
            <Icon name={t.icon} className={cn('mt-0.5 shrink-0 text-base', t.color)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** ChannelAssessment — teaching style, who it suits, pros/cons and our verdict. Empty parts are hidden. */
export function ChannelAssessment({ channel }: { channel: ClassChannelProfile }) {
  return (
    <div className="space-y-6 border-t border-outline-variant/40 pt-6">
      {channel.teachingStyle && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            <Icon name="history_edu" className="text-base" />
            Teaching style
          </h4>
          <p className="max-w-prose text-sm leading-relaxed text-on-surface">{channel.teachingStyle}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <PointList title="Best for" items={channel.bestFor} tone="good" />
        <PointList title="Not ideal for" items={channel.notFor} tone="bad" />
        <PointList title="Pros" items={channel.pros} tone="good" />
        <PointList title="Cons" items={channel.cons} tone="bad" />
      </div>

      {channel.verdict && (
        <figure className="rounded-xl border-l-4 border-[color:var(--channel-accent)] bg-surface-container-low px-5 py-4">
          <figcaption className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Our verdict</figcaption>
          <blockquote className="mt-1 font-headline text-base font-semibold text-on-surface">{channel.verdict}</blockquote>
        </figure>
      )}
    </div>
  )
}
