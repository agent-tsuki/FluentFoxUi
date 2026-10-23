/**
 * Helpers for adding a YouTube channel in the admin: read what an editor
 * pastes (a channel link or an @handle) and suggest a URL-safe slug.
 */

export interface YouTubeChannelRef {
  /** Canonical channel URL, stored as the channel's link. */
  url: string
  /** "@handle", when the link used one. The backend sync looks the channel up by it. */
  handle: string | null
  /** "UC…" id, when the link used one. */
  channelId: string | null
}

const HANDLE = /^@[\w.-]{3,100}$/
const CHANNEL_ID = /^UC[\w-]{22}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com'])

/**
 * Accepts "@handle", "youtube.com/@handle" or "youtube.com/channel/UC…"
 * (with or without https://). Returns null for anything else, including
 * video and playlist links.
 */
export function parseYouTubeChannel(input: string): YouTubeChannelRef | null {
  const raw = input.trim()
  if (HANDLE.test(raw)) return { url: `https://www.youtube.com/${raw}`, handle: raw, channelId: null }

  let parsed: URL
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (!YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) return null

  const [first = '', second = ''] = parsed.pathname.split('/').filter(Boolean)
  const handle = decodeURIComponent(first)
  if (HANDLE.test(handle)) return { url: `https://www.youtube.com/${handle}`, handle, channelId: null }
  if (first === 'channel' && CHANNEL_ID.test(second)) {
    return { url: `https://www.youtube.com/channel/${second}`, handle: null, channelId: second }
  }
  return null
}

/** "Japanese Ammo with Misa" → "japanese-ammo-with-misa" (matches the backend slug pattern). */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}
