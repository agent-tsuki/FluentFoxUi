import { describe, expect, it } from 'vitest'
import { availableVoice, clipUrl, voiceCredits } from './audioInfo'

const INFO = {
  enabled: true,
  base_url: 'https://cdn.test/audio/v2/voicevox-14',
  ext: '.mp3',
  credit: 'VOICEVOX:冥鳴ひまり',
  voices: {
    f1: { base_url: 'https://cdn.test/audio/v2/aivisspeech-888753760', credit: 'AivisSpeech:まお' },
    m1: { base_url: 'https://cdn.test/audio/v2/aivisspeech-606865152' },
  },
}

describe('voices', () => {
  it('uses a cast voice the API has, and the main voice for one it lacks', () => {
    expect(availableVoice(INFO, 'f1')).toBe('f1')
    expect(availableVoice(INFO, 'm4')).toBe('main')
    expect(availableVoice(INFO, 'alt')).toBe('main')
    expect(availableVoice({ ...INFO, alt_base_url: 'https://cdn.test/a' }, 'alt')).toBe('alt')
  })

  it('names each voice’s clips in its own folder', () => {
    expect(clipUrl(INFO, 'abc', 'm1')).toBe('https://cdn.test/audio/v2/aivisspeech-606865152/abc.mp3')
    expect(clipUrl(INFO, 'abc', 'f9')).toBe('https://cdn.test/audio/v2/voicevox-14/abc.mp3')
    expect(clipUrl(INFO, 'abc')).toBe('https://cdn.test/audio/v2/voicevox-14/abc.mp3')
  })

  it('lists every credit once', () => {
    expect(voiceCredits({ ...INFO, alt_credit: 'VOICEVOX:冥鳴ひまり' })).toEqual(['VOICEVOX:冥鳴ひまり', 'AivisSpeech:まお'])
  })
})
