import { describe, expect, it } from 'vitest'
import { courseExternalUrl, hasPlayablePlaylist, isPlaylistId, playlistEmbedUrl, playlistPageUrl } from '@/lib/classes/youtube'

const ID = 'PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj'

describe('playlist ids', () => {
  it('accepts real ids and rejects anything unsafe', () => {
    expect(isPlaylistId(ID)).toBe(true)
    expect(isPlaylistId('short')).toBe(false)
    expect(isPlaylistId(`${ID}&autoplay=0`)).toBe(false)
    expect(isPlaylistId('PL"><script>')).toBe(false)
    expect(isPlaylistId('x'.repeat(65))).toBe(false)
    expect(isPlaylistId(null)).toBe(false)
    expect(isPlaylistId(undefined)).toBe(false)
  })

  it('builds the nocookie videoseries embed', () => {
    expect(playlistEmbedUrl(ID)).toBe(`https://www.youtube-nocookie.com/embed/videoseries?list=${ID}&autoplay=1&rel=0`)
    expect(playlistEmbedUrl('bad id!')).toBeNull()
  })

  it('builds the playlist page URL', () => {
    expect(playlistPageUrl(ID)).toBe(`https://www.youtube.com/playlist?list=${ID}`)
    expect(playlistPageUrl(null)).toBeNull()
  })
})

describe('courseExternalUrl', () => {
  it('prefers the playlist over the course URL', () => {
    expect(courseExternalUrl({ url: 'https://www.youtube.com/@x', playlistId: ID })).toBe(`https://www.youtube.com/playlist?list=${ID}`)
    expect(courseExternalUrl({ url: 'https://www.udemy.com/course/x/', playlistId: null })).toBe('https://www.udemy.com/course/x/')
    expect(courseExternalUrl({ url: 'https://www.youtube.com/@x', playlistId: 'bad' })).toBe('https://www.youtube.com/@x')
  })
})

describe('hasPlayablePlaylist', () => {
  it.each([
    ['youtube', 1, null, true],
    ['youtube', 0, ID, true],
    ['youtube', 0, null, false],
    ['youtube', 0, 'bad', false],
    ['udemy', 0, ID, false],
    ['website', 3, null, false],
  ] as const)('%s, %s videos, playlist %s → %s', (platform, count, playlistId, expected) => {
    expect(hasPlayablePlaylist({ platform, videos: Array.from({ length: count }), playlistId })).toBe(expected)
  })
})
