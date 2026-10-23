/**
 * YouTube URL helpers for the Classes pages. Pure functions, unit-tested.
 *
 * Embeds use www.youtube.com, not youtube-nocookie.com: YouTube answers a
 * nocookie play with "Sign in to confirm you're not a bot" for many viewers
 * (seen in production, 2026-10-23). The player still loads only on click.
 * The CSP `frame-src` (vite.config.ts) must allow this origin.
 */

export const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube.com'

/** Playlist ids are URL-safe base64 ("PL…", "UU…", "OL…"); length varies by type. */
const PLAYLIST_ID = /^[A-Za-z0-9_-]{10,64}$/

/** True when `id` is safe to put in a playlist URL. */
export function isPlaylistId(id: string | null | undefined): id is string {
  return typeof id === 'string' && PLAYLIST_ID.test(id)
}

/** Click-to-load player URL for a whole playlist, or null for an invalid id. */
export function playlistEmbedUrl(id: string | null | undefined): string | null {
  return isPlaylistId(id) ? `${YOUTUBE_EMBED_ORIGIN}/embed/videoseries?list=${id}&autoplay=1&rel=0` : null
}

/** The playlist page on YouTube, or null for an invalid id. */
export function playlistPageUrl(id: string | null | undefined): string | null {
  return isPlaylistId(id) ? `https://www.youtube.com/playlist?list=${id}` : null
}

/** Where "Open on YouTube" goes: the playlist when known, else the course URL. */
export function courseExternalUrl(course: { url: string; playlistId: string | null }): string {
  return playlistPageUrl(course.playlistId) ?? course.url
}


const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const THUMBNAIL_VIDEO_ID = /^https:\/\/i\.ytimg\.com\/vi\/([A-Za-z0-9_-]{11})\//

/**
 * The one video the course page plays as a sample: the video the cover image
 * comes from (covers are i.ytimg.com/vi/<id>/… thumbnails), else the first
 * playlist video. Null when neither is known (the page then plays the playlist).
 */
export function sampleVideoId(course: { thumbnailUrl: string | null; videos: readonly { youtubeVideoId: string }[] }): string | null {
  const fromCover = course.thumbnailUrl?.match(THUMBNAIL_VIDEO_ID)?.[1]
  if (fromCover) return fromCover
  const first = course.videos[0]?.youtubeVideoId
  return first && VIDEO_ID.test(first) ? first : null
}
