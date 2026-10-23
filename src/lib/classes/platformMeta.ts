import type { ClassPlatform } from '@/types/classes'

/**
 * PLATFORM_META — per-platform display metadata (label, icon, token colour classes)
 * for YouTube / Udemy / Website course badges, shared by the list and detail pages.
 */
export interface PlatformMeta {
  label: string
  icon: string
  /** Text/icon colour, e.g. `text-error`. */
  colorClass: string
  /** Solid background, for buttons and accent bars, e.g. `bg-error`. */
  solidClass: string
  /** Low-opacity tint, for badges, e.g. `bg-error/10`. */
  tintClass: string
}

export const PLATFORM_META: Record<ClassPlatform, PlatformMeta> = {
  youtube: { label: 'YouTube', icon: 'smart_display', colorClass: 'text-error',    solidClass: 'bg-error',    tintClass: 'bg-error/10' },
  udemy:   { label: 'Udemy',   icon: 'school',        colorClass: 'text-tertiary', solidClass: 'bg-tertiary', tintClass: 'bg-tertiary/10' },
  website: { label: 'Website', icon: 'language',      colorClass: 'text-info',     solidClass: 'bg-info',     tintClass: 'bg-info/10' },
}

export const CLASS_PLATFORMS: ClassPlatform[] = ['youtube', 'udemy', 'website']
