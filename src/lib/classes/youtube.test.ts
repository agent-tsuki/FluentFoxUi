import { describe, expect, it } from 'vitest'
import { courseExternalUrl, isPlaylistId, playlistEmbedUrl, playlistPageUrl, sampleVideoId } from '@/lib/classes/youtube'

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

  it('builds the videoseries embed', () => {
    expect(playlistEmbedUrl(ID)).toBe(`https://www.youtube.com/embed/videoseries?list=${ID}&autoplay=1&rel=0`)
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


describe('sampleVideoId', () => {
  const video = (youtubeVideoId: string) => ({ youtubeVideoId })

  it('plays the video the cover comes from', () => {
    expect(sampleVideoId({ thumbnailUrl: 'https://i.ytimg.com/vi/qXoqOvJ9pBE/hqdefault.jpg', videos: [video('1XhJo_c-uvA')] })).toBe('qXoqOvJ9pBE')
  })

  it('falls back to the first video when the cover is not a YouTube thumbnail', () => {
    expect(sampleVideoId({ thumbnailUrl: 'https://cdn.example.com/cover.png', videos: [video('1XhJo_c-uvA')] })).toBe('1XhJo_c-uvA')
    expect(sampleVideoId({ thumbnailUrl: null, videos: [video('1XhJo_c-uvA')] })).toBe('1XhJo_c-uvA')
  })

  it('returns null when there is nothing safe to play', () => {
    expect(sampleVideoId({ thumbnailUrl: null, videos: [] })).toBeNull()
    expect(sampleVideoId({ thumbnailUrl: null, videos: [video('bad id')] })).toBeNull()
    expect(sampleVideoId({ thumbnailUrl: 'https://i.ytimg.com/vi/short/hqdefault.jpg', videos: [] })).toBeNull()
  })
})
