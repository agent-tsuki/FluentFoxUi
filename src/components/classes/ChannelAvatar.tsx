import { useState } from 'react'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/classes/format'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'profile'

interface ChannelAvatarProps {
  name: string
  avatarUrl: string | null
  size?: AvatarSize
  /** `eager` for above-the-fold avatars (course hero, channel card). */
  loading?: 'lazy' | 'eager'
  className?: string
}

const SIZES: Record<AvatarSize, { box: string; text: string; px: number }> = {
  sm:      { box: 'size-6',  text: 'text-2xs', px: 24 },
  md:      { box: 'size-10', text: 'text-xs',  px: 40 },
  lg:      { box: 'size-14', text: 'text-base', px: 56 },
  xl:      { box: 'size-24', text: 'text-2xl', px: 96 },
  /** The channel card: 80px on phones, 96px from md. */
  profile: { box: 'size-20 md:size-24', text: 'text-2xl', px: 96 },
}

/**
 * ChannelAvatar — a channel's round profile picture, or its initials when it
 * has none or the image fails to load (hotlinked YouTube avatars can expire).
 */
export function ChannelAvatar({ name, avatarUrl, size = 'md', loading = 'lazy', className }: ChannelAvatarProps) {
  const s = SIZES[size]
  // Remember which URL failed, so a new URL (another channel) gets a fresh try.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (avatarUrl && failedUrl !== avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name} profile picture`}
        width={s.px}
        height={s.px}
        loading={loading}
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(avatarUrl)}
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
