import { describe, expect, it } from 'vitest'
import { clipHash, sentences } from './speechText'
import vectors from './sentences.vectors.json'

describe('sentences (shared vectors with the API)', () => {
  it.each(vectors.map((v) => [v.name, v] as const))('%s', (_name, v) => {
    expect(sentences(v.text)).toEqual(v.sentences)
  })
})

describe('clipHash', () => {
  it('is the hex SHA-256 of the sentence, as the API names clips', async () => {
    expect(await clipHash('あさ')).toBe('1ba626dd871ec1ff07633de4c85693e2fed2ceb5e619601804187c86275cf2fb')
  })
})

describe('versionRoot', () => {
  it('keeps every voice of the current version folder', async () => {
    const { versionRoot } = await import('./audioInfo')
    expect(versionRoot('https://cdn.foxsensei.com/audio/v2/voicevox-14')).toBe('https://cdn.foxsensei.com/audio/v2/')
  })
})
