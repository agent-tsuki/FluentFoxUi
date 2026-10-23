/**
 * YouTube URL helpers for the Classes pages. Pure functions, unit-tested.
 *
 * Embeds always use youtube-nocookie.com: the CSP `frame-src` (vite.config.ts)
 * allows only that origin, so www.youtube.com/embed would be blocked.
 */
import type { ClassPlatform } from '@/types/classes'

/** Playlist ids are URL-safe base64 ("PL…", "UU…", "OL…"); length varies by type. */
const PLAYLIST_ID = /^[A-Za-z0-9_-]{10,64}$/

/** True when `id` is safe to put in a playlist URL. */
export function isPlaylistId(id: string | null | undefined): id is string {
  return typeof id === 'string' && PLAYLIST_ID.test(id)
}

/** Click-to-load player URL for a whole playlist, or null for an invalid id. */
export function playlistEmbedUrl(id: string | null | undefined): string | null {
  return isPlaylistId(id) ? `https://www.youtube-nocookie.com/embed/videoseries?list=${id}&autoplay=1&rel=0` : null
}

/** The playlist page on YouTube, or null for an invalid id. */
export function playlistPageUrl(id: string | null | undefined): string | null {
  return isPlaylistId(id) ? `https://www.youtube.com/playlist?list=${id}` : null
}

/** Where "Open on YouTube" goes: the playlist when known, else the course URL. */
export function courseExternalUrl(course: { url: string; playlistId: string | null }): string {
  return playlistPageUrl(course.playlistId) ?? course.url
}

/** A course has something to play on the page: synced videos, or at least a playlist id. */
export function hasPlayablePlaylist(course: { platform: ClassPlatform; videos: readonly unknown[]; playlistId: string | null }): boolean {
  return course.platform === 'youtube' && (course.videos.length > 0 || isPlaylistId(course.playlistId))
}
