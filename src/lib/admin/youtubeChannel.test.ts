import { describe, expect, it } from 'vitest'
import { parseYouTubeChannel, slugify } from '@/lib/admin/youtubeChannel'

describe('parseYouTubeChannel', () => {
  it('reads a bare handle and handle links', () => {
    const want = { url: 'https://www.youtube.com/@ToKiniAndy', handle: '@ToKiniAndy', channelId: null }
    expect(parseYouTubeChannel('@ToKiniAndy')).toEqual(want)
    expect(parseYouTubeChannel('https://www.youtube.com/@ToKiniAndy')).toEqual(want)
    expect(parseYouTubeChannel('  youtube.com/@ToKiniAndy/videos?view=0 ')).toEqual(want)
    expect(parseYouTubeChannel('https://m.youtube.com/@ToKiniAndy')).toEqual(want)
  })

  it('reads a channel id link', () => {
    expect(parseYouTubeChannel('https://www.youtube.com/channel/UCBSyd8tXJoEJKIXfrwkPdbA')).toEqual({
      url: 'https://www.youtube.com/channel/UCBSyd8tXJoEJKIXfrwkPdbA',
      handle: null,
      channelId: 'UCBSyd8tXJoEJKIXfrwkPdbA',
    })
  })

  it('rejects anything that is not a channel', () => {
    expect(parseYouTubeChannel('')).toBeNull()
    expect(parseYouTubeChannel('https://www.youtube.com/watch?v=WYYaf711IEM')).toBeNull()
    expect(parseYouTubeChannel('https://www.youtube.com/playlist?list=PL1')).toBeNull()
    expect(parseYouTubeChannel('https://example.com/@misa')).toBeNull()
    expect(parseYouTubeChannel('not a link')).toBeNull()
  })
})

describe('slugify', () => {
  it('makes a URL-safe slug', () => {
    expect(slugify('Japanese Ammo with Misa')).toBe('japanese-ammo-with-misa')
    expect(slugify('  Cure Dolly 日本語!! ')).toBe('cure-dolly')
    expect(slugify('Café Nihongo')).toBe('cafe-nihongo')
    expect(slugify('日本語')).toBe('')
  })
})
