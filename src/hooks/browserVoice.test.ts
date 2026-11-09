import { describe, expect, it, vi } from 'vitest'

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
const { browserVoiceFor } = await import('./useJapaneseSpeech')

const voice = (name: string) => ({ name, lang: 'ja-JP' }) as SpeechSynthesisVoice

describe('browserVoiceFor', () => {
  const kyoko = voice('Kyoko')
  it('speaks the main voice as is', () => {
    expect(browserVoiceFor('main', kyoko, [kyoko])).toEqual({ voice: kyoko, pitch: 1 })
  })

  it('tells the cast apart by pitch when there is one Japanese voice', () => {
    const pitches = ['f1', 'f2', 'f3', 'm1', 'm2', 'm3'].map((k) => browserVoiceFor(k, kyoko, [kyoko]).pitch)
    expect(new Set(pitches).size).toBe(pitches.length)
    expect(browserVoiceFor('m1', kyoko, [kyoko]).pitch).toBeLessThan(1)
  })

  it('gives men a male system voice when there is one', () => {
    const otoya = voice('Otoya')
    expect(browserVoiceFor('m2', kyoko, [kyoko, otoya]).voice).toBe(otoya)
    expect(browserVoiceFor('alt', kyoko, [kyoko, otoya]).voice).toBe(otoya)
    expect(browserVoiceFor('f2', kyoko, [kyoko, otoya]).voice).toBe(kyoko)
  })
})
