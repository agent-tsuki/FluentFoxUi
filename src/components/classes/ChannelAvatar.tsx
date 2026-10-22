import { cn } from '@/lib/cn'
import { initials } from '@/lib/classes/format'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface ChannelAvatarProps {
  name: string
  avatarUrl: string | null
  size?: AvatarSize
  className?: string
}

const SIZES: Record<AvatarSize, { box: string; text: string; px: number }> = {
  sm: { box: 'size-6',  text: 'text-2xs', px: 24 },
  md: { box: 'size-10', text: 'text-xs',  px: 40 },
  lg: { box: 'size-14', text: 'text-base', px: 56 },
  xl: { box: 'size-24', text: 'text-2xl', px: 96 },
}

/** ChannelAvatar — a channel's round profile picture, or its initials when it has none. */
export function ChannelAvatar({ name, avatarUrl, size = 'md', className }: ChannelAvatarProps) {
  const s = SIZES[size]
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name} profile picture`}
        width={s.px}
        height={s.px}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-full bg-surface-container-high object-cover', s.box, className)}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-container-high font-headline font-extrabold text-on-surface-variant',
        s.box,
        s.text,
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
